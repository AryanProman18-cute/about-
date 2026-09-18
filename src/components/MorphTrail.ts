import { useEffect, type RefObject } from 'react';

/**
 * Mouse morph-reveal trail for the hero lily.
 *
 * Not a CSS circle spotlight. An organic, morphing blob trail follows the
 * cursor across the flower, and the same trail drives two complementary
 * canvas layers that sit exactly over the lily:
 *
 *   front layer   draws the front lily, then stamps the shared blob canvas
 *                 with destination-out, so the trail punches holes in the
 *                 front bloom (heading and backdrop show through).
 *   reveal layer  draws the warm reveal lily, then stamps the same blobs
 *                 with destination-in, so the warm bloom is painted only
 *                 inside the trail.
 *
 * Everything is composited directly on canvas: no CSS mask-image and no
 * data URLs, so the wipe renders identically in every browser and never
 * blinks out. The wordmark still shows through the transparent petals.
 */

export const TRAIL_MAX_POINTS = 60;
export const TRAIL_HEAD_R = 98;
export const TRAIL_NOISE_AMP = 31;
export const TRAIL_BLOB_PTS = 24;
export const TRAIL_FADE_SPEED = 0.92;
export const TRAIL_SAMPLE_DIST = 8;

// Head opens quickly and closes slowly, so the wipe blooms in and melts out.
const HEAD_OPEN_EASE = 0.14;
const HEAD_CLOSE_EASE = 0.04;

// The trail stays alive as long as anything can still draw: an open head,
// undecayed points, or an active hover.
const HEAD_IDLE_R = 0.5;

type TrailPoint = { x: number; y: number; r: number; alpha: number; seed: number };

// Tiny diagnostics handle so the trail can be profiled from devtools.
declare global {
  interface Window {
    __morphTrailStats?: { factor: number; workEma: number; frames: number };
  }
}

/** Organic blob: a circle whose radius breathes through three slow sine
 *  harmonics (each point carries its own seed, so every blob in the trail
 *  morphs differently), closed as one smooth curve through midpoints. */
function drawMorphBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  t: number,
  seed: number
) {
  if (r < 2) return;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < TRAIL_BLOB_PTS; i++) {
    const angle = (i / TRAIL_BLOB_PTS) * Math.PI * 2;
    const n1 = Math.sin(angle * 3 + t * 1.4 + seed) * 0.45;
    const n2 = Math.sin(angle * 5 - t * 0.9 + seed * 2.3) * 0.3;
    const n3 = Math.cos(angle * 2 + t * 1.8 + seed * 0.7) * 0.25;
    const noise = (n1 + n2 + n3) * TRAIL_NOISE_AMP * (r / TRAIL_HEAD_R);
    const rad = r + noise;
    pts.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
  }
  ctx.beginPath();
  let mx = (pts[pts.length - 1][0] + pts[0][0]) / 2;
  let my = (pts[pts.length - 1][1] + pts[0][1]) / 2;
  ctx.moveTo(mx, my);
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % pts.length];
    mx = (cur[0] + next[0]) / 2;
    my = (cur[1] + next[1]) / 2;
    ctx.quadraticCurveTo(cur[0], cur[1], mx, my);
  }
  ctx.closePath();
  ctx.fill();
}

/** One visible canvas layer over the flower. The source image is drawn at
 *  the flower's CSS size, then the shared blob canvas is stamped in with a
 *  composite mode: destination-out cuts holes, destination-in keeps only
 *  the blob shape. Returns false while the image is still decoding, so the
 *  caller can keep the original img visible for that time. */
class CompositeLayer {
  private readonly ctx: CanvasRenderingContext2D;
  cssW = 0;
  cssH = 0;

  constructor(private readonly el: HTMLCanvasElement) {
    const ctx = el.getContext('2d');
    if (!ctx) throw new Error('canvas 2d context unavailable');
    this.ctx = ctx;
  }

  resize(cssW: number, cssH: number, factor: number) {
    this.cssW = cssW;
    this.cssH = cssH;
    const w = Math.max(2, Math.round(cssW * factor));
    const h = Math.max(2, Math.round(cssH * factor));
    if (this.el.width !== w || this.el.height !== h) {
      this.el.width = w;
      this.el.height = h;
    }
    // Setting the bitmap size resets all context state, so re-apply the
    // transform and the high quality resampling for the lily art.
    this.ctx.setTransform(w / cssW, 0, 0, h / cssH, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  draw(img: HTMLImageElement, blob: HTMLCanvasElement, mode: GlobalCompositeOperation): boolean {
    if (this.cssW < 2 || !(img.complete && img.naturalWidth > 0)) return false;
    const { ctx } = this;
    ctx.clearRect(0, 0, this.cssW, this.cssH);
    ctx.drawImage(img, 0, 0, this.cssW, this.cssH);
    ctx.globalCompositeOperation = mode;
    ctx.drawImage(blob, 0, 0, this.cssW, this.cssH);
    ctx.globalCompositeOperation = 'source-over';
    return true;
  }

  clear() {
    if (this.cssW >= 2) this.ctx.clearRect(0, 0, this.cssW, this.cssH);
  }
}

interface MorphTrailRefs {
  /** Stage: the element that owns hover (mouse events fire anywhere on it). */
  stage: RefObject<HTMLElement | null>;
  /** Flower: the element the canvases are sized to and coords map into. */
  flower: RefObject<HTMLElement | null>;
  /** Front lily img: hidden while the front canvas paints it with holes. */
  front: RefObject<HTMLImageElement | null>;
  /** Reveal lily img: never displayed, only used as the drawImage source. */
  reveal: RefObject<HTMLImageElement | null>;
  /** Visible canvas over the flower painting the front lily with holes. */
  frontCanvas: RefObject<HTMLCanvasElement | null>;
  /** Visible canvas over the flower painting the reveal lily in blobs. */
  revealCanvas: RefObject<HTMLCanvasElement | null>;
}

export function useMorphTrail({ stage, flower, front, reveal, frontCanvas, revealCanvas }: MorphTrailRefs) {
  useEffect(() => {
    const stageEl = stage.current;
    const flowerEl = flower.current;
    const frontEl = front.current;
    const revealEl = reveal.current;
    const frontCanvasEl = frontCanvas.current;
    const revealCanvasEl = revealCanvas.current;
    if (!stageEl || !flowerEl || !frontEl || !revealEl || !frontCanvasEl || !revealCanvasEl) return;
    // Static front bloom only when the visitor prefers reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frontLayer: CompositeLayer;
    let revealLayer: CompositeLayer;
    const blob = document.createElement('canvas');
    const blobCtx = blob.getContext('2d');
    try {
      frontLayer = new CompositeLayer(frontCanvasEl);
      revealLayer = new CompositeLayer(revealCanvasEl);
    } catch {
      return; // no 2d context: keep the plain front lily, always visible
    }
    if (!blobCtx) return;

    let points: TrailPoint[] = [];
    let headRadius = 0;
    let hovering = false;
    let time = 0;
    let raf = 0;
    let running = false;
    // Canvas resolution factor: the device pixel ratio, capped, and stepped
    // down if the per frame compositing work ever runs long.
    let factor = Math.min(window.devicePixelRatio || 1, 1.5);
    let workEma = 0;
    let slowStreak = 0;
    let frames = 0;
    // Mouse kept in client space: the head is reprojected into flower space
    // every frame, so it stays glued to the cursor even while the flower
    // shifts under it.
    const mouse = { x: 0, y: 0 };
    const lastSample = { x: -9999, y: -9999 };
    const HEAD_SEED = 37.2;

    const resizeAll = () => {
      const rect = flowerEl.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      frontLayer.resize(rect.width, rect.height, factor);
      revealLayer.resize(rect.width, rect.height, factor);
      const w = Math.max(2, Math.round(rect.width * factor));
      const h = Math.max(2, Math.round(rect.height * factor));
      if (blob.width !== w || blob.height !== h) {
        blob.width = w;
        blob.height = h;
      }
      blobCtx.setTransform(w / rect.width, 0, 0, h / rect.height, 0, 0);
    };

    const toFlower = (clientX: number, clientY: number) => {
      const rect = flowerEl.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / Math.max(1, rect.width)) * rect.width,
        y: ((clientY - rect.top) / Math.max(1, rect.height)) * rect.height,
      };
    };

    const frame = () => {
      const t0 = performance.now();
      time += 0.016;

      // Head eases open on hover and lerps shut on leave.
      const targetR = hovering ? TRAIL_HEAD_R : 0;
      headRadius += (targetR - headRadius) * (hovering ? HEAD_OPEN_EASE : HEAD_CLOSE_EASE);

      // Sample a trail point whenever the cursor moved far enough.
      const head = toFlower(mouse.x, mouse.y);
      if (hovering && headRadius > 5) {
        const dx = head.x - lastSample.x;
        const dy = head.y - lastSample.y;
        if (Math.hypot(dx, dy) > TRAIL_SAMPLE_DIST) {
          points.push({ x: head.x, y: head.y, r: headRadius, alpha: 1, seed: Math.random() * 100 });
          if (points.length > TRAIL_MAX_POINTS) points.shift();
          lastSample.x = head.x;
          lastSample.y = head.y;
        }
      }

      // Trail decays behind the cursor and is culled when invisible.
      for (const p of points) {
        p.alpha *= TRAIL_FADE_SPEED;
        p.r *= 0.995;
      }
      points = points.filter((p) => p.alpha >= 0.01);

      const liveHead: TrailPoint | null =
        headRadius > 2 ? { x: head.x, y: head.y, r: headRadius, alpha: 1, seed: HEAD_SEED } : null;

      if (hovering || points.length > 0 || headRadius > HEAD_IDLE_R) {
        // Stamp every blob once, then reuse the stamp for both layers.
        blobCtx.clearRect(0, 0, frontLayer.cssW, frontLayer.cssH);
        for (const p of points) {
          blobCtx.globalAlpha = p.alpha;
          drawMorphBlob(blobCtx, p.x, p.y, p.r, time, p.seed);
        }
        if (liveHead) {
          blobCtx.globalAlpha = 1;
          drawMorphBlob(blobCtx, liveHead.x, liveHead.y, liveHead.r, time, liveHead.seed);
        }
        blobCtx.globalAlpha = 1;

        const frontDrawn = frontLayer.draw(frontEl, blob, 'destination-out');
        revealLayer.draw(revealEl, blob, 'destination-in');
        // Swap the plain img for the canvas only once the canvas actually
        // painted, so the lily can never blink away.
        if (frontDrawn) frontEl.style.visibility = 'hidden';

        // Adaptive resolution: sustained expensive frames step the factor
        // down, which cheapens the compositing work.
        const work = performance.now() - t0;
        workEma = workEma === 0 ? work : workEma * 0.8 + work * 0.2;
        if (workEma > 16) slowStreak += 1;
        else slowStreak = Math.max(0, slowStreak - 1);
        if (slowStreak > 5 && factor > 0.75) {
          factor = Math.max(0.75, factor * 0.75);
          workEma = 0;
          slowStreak = 0;
          resizeAll();
        }
        frames += 1;
        window.__morphTrailStats = { factor, workEma, frames };
        raf = requestAnimationFrame(frame);
      } else {
        // Trail fully died: whole front bloom again, canvases wiped.
        frontEl.style.visibility = '';
        frontLayer.clear();
        revealLayer.clear();
        running = false;
      }
    };

    const kick = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e: globalThis.MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // Only a real mousemove activates the trail. Chrome fires a phantom
      // mouseenter at page load when a stationary pointer already sits over
      // the hero (hover state recompute on layout settle); treating that as
      // a hover would run the trail forever with no pointer anywhere near.
      hovering = true;
      kick();
    };
    const onLeave = () => {
      hovering = false;
      kick();
    };

    resizeAll();
    stageEl.addEventListener('mousemove', onMove);
    stageEl.addEventListener('mouseleave', onLeave);
    const observer = new ResizeObserver(() => {
      resizeAll();
      kick();
    });
    observer.observe(flowerEl);

    return () => {
      stageEl.removeEventListener('mousemove', onMove);
      stageEl.removeEventListener('mouseenter', onMove);
      stageEl.removeEventListener('mouseleave', onLeave);
      observer.disconnect();
      if (running) cancelAnimationFrame(raf);
      running = false;
      frontEl.style.visibility = '';
      frontLayer.clear();
      revealLayer.clear();
    };
  }, [stage, flower, front, reveal, frontCanvas, revealCanvas]);
}
