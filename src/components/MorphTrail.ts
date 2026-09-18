import { useEffect, type RefObject } from 'react';

/**
 * Mouse morph-reveal trail for the hero lily.
 *
 * Not a CSS circle spotlight. An organic, morphing blob trail follows the
 * cursor across the flower. The same trail drives two complementary masks:
 *
 *   invert=false  FRONT lily: canvas filled white, blobs punched out with
 *                 destination-out, so the trail leaves holes in the front
 *                 bloom (heading and backdrop show through).
 *   invert=true   REVEAL lily: clear canvas, white blobs, so the warm bloom
 *                 is painted only inside the trail.
 *
 * Every active frame the canvas bitmaps are pushed into the img masks via
 * mask-image: url(canvas.toDataURL()), size 100% 100%, no repeat. The
 * wordmark still shows through the transparent petals of both images.
 */

export const TRAIL_MAX_POINTS = 60;
export const TRAIL_HEAD_R = 140;
export const TRAIL_NOISE_AMP = 44;
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
    __morphTrailStats?: { scale: number; workEma: number; frames: number };
  }
}

/** One masked layer: an offscreen canvas whose bitmap becomes the mask of a
 *  cover-fit img. invert picks punch-holes (front) versus paint-blobs (reveal). */
class MorphTrailLayer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly invert: boolean;
  private cssW = 0;
  private cssH = 0;
  private scale = 1;

  constructor(invert: boolean) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 2d context unavailable');
    this.canvas = canvas;
    this.ctx = ctx;
    this.invert = invert;
  }

  /** Size the backing bitmap to the flower box, optionally at a reduced
   *  resolution. Masks are smooth organic shapes, so a half resolution
   *  bitmap stretches invisibly while encoding twice as fast. */
  resize(cssW: number, cssH: number, scale: number) {
    this.cssW = cssW;
    this.cssH = cssH;
    this.scale = scale;
    const w = Math.max(2, Math.round(cssW * scale));
    const h = Math.max(2, Math.round(cssH * scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  redraw(points: TrailPoint[], head: TrailPoint | null, time: number) {
    const { ctx } = this;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (this.invert) {
      // Reveal layer: transparent base, white blobs are the only visible area.
      ctx.clearRect(0, 0, this.cssW, this.cssH);
    } else {
      // Front layer: opaque white base, blobs are punched out as holes.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.cssW, this.cssH);
      ctx.globalCompositeOperation = 'destination-out';
    }
    for (const p of points) {
      ctx.globalAlpha = p.alpha;
      drawMorphBlob(ctx, p.x, p.y, p.r, time, p.seed);
    }
    if (head) {
      ctx.globalAlpha = head.alpha;
      drawMorphBlob(ctx, head.x, head.y, head.r, time, head.seed);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
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

interface MorphTrailRefs {
  /** Stage: the element that owns hover (mouse events fire anywhere on it). */
  stage: RefObject<HTMLElement | null>;
  /** Flower: the element the canvases are sized to and coords map into. */
  flower: RefObject<HTMLElement | null>;
  /** Front lily img: holes get punched where the trail passes. */
  front: RefObject<HTMLImageElement | null>;
  /** Reveal lily img: painted only where the trail passes. */
  reveal: RefObject<HTMLImageElement | null>;
}

export function useMorphTrail({ stage, flower, front, reveal }: MorphTrailRefs) {
  useEffect(() => {
    const stageEl = stage.current;
    const flowerEl = flower.current;
    const frontEl = front.current;
    const revealEl = reveal.current;
    if (!stageEl || !flowerEl || !frontEl || !revealEl) return;
    // Static front bloom only when the visitor prefers reduced motion.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const frontLayer = new MorphTrailLayer(false);
    const revealLayer = new MorphTrailLayer(true);
    let points: TrailPoint[] = [];
    let headRadius = 0;
    let hovering = false;
    let time = 0;
    let raf = 0;
    let running = false;
    // Bitmap resolution, halved at most twice if the per frame work (canvas
    // encode) keeps running long, so slower machines still get a fluid trail.
    let scale = 1;
    let workEma = 0;
    let slowStreak = 0;
    let frames = 0;
    // Mouse kept in client space: the head is reprojected into flower space
    // every frame, so it stays glued to the cursor even while the flower
    // shifts under it.
    const mouse = { x: 0, y: 0 };
    const lastSample = { x: -9999, y: -9999 };
    const HEAD_SEED = 37.2;

    const syncCanvasSize = () => {
      const rect = flowerEl.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      frontLayer.resize(rect.width, rect.height, scale);
      revealLayer.resize(rect.width, rect.height, scale);
    };

    const toFlower = (clientX: number, clientY: number) => {
      const rect = flowerEl.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / Math.max(1, rect.width)) * rect.width,
        y: ((clientY - rect.top) / Math.max(1, rect.height)) * rect.height,
      };
    };

    const setMaskBox = (el: HTMLElement) => {
      el.style.setProperty('mask-size', '100% 100%');
      el.style.setProperty('-webkit-mask-size', '100% 100%');
      el.style.setProperty('mask-repeat', 'no-repeat');
      el.style.setProperty('-webkit-mask-repeat', 'no-repeat');
    };
    const applyMask = (el: HTMLElement, layer: MorphTrailLayer) => {
      const url = `url(${layer.canvas.toDataURL()})`;
      el.style.setProperty('mask-image', url);
      el.style.setProperty('-webkit-mask-image', url);
    };
    const clearMask = (el: HTMLElement) => {
      el.style.removeProperty('mask-image');
      el.style.removeProperty('-webkit-mask-image');
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
        frontLayer.redraw(points, liveHead, time);
        revealLayer.redraw(points, liveHead, time);
        applyMask(frontEl, frontLayer);
        applyMask(revealEl, revealLayer);
        revealEl.style.opacity = '1';
        // Adaptive resolution: sustained expensive frames drop the bitmap
        // scale, which quarters the encode cost. Measured as real work time
        // inside the frame, so display cadence never confuses it.
        const work = performance.now() - t0;
        workEma = workEma === 0 ? work : workEma * 0.8 + work * 0.2;
        if (workEma > 18) slowStreak += 1;
        else slowStreak = Math.max(0, slowStreak - 1);
        if (slowStreak > 8 && scale > 0.25) {
          scale /= 2;
          workEma = 0;
          slowStreak = 0;
          syncCanvasSize();
        }
        frames += 1;
        window.__morphTrailStats = { scale, workEma, frames };
        raf = requestAnimationFrame(frame);
      } else {
        // Trail fully died: front is whole again, reveal hidden.
        revealEl.style.opacity = '0';
        clearMask(frontEl);
        clearMask(revealEl);
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
      hovering = true;
      kick();
    };
    const onLeave = () => {
      hovering = false;
      kick();
    };

    setMaskBox(frontEl);
    setMaskBox(revealEl);
    syncCanvasSize();
    stageEl.addEventListener('mousemove', onMove);
    stageEl.addEventListener('mouseenter', onMove);
    stageEl.addEventListener('mouseleave', onLeave);
    const observer = new ResizeObserver(() => {
      syncCanvasSize();
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
      revealEl.style.removeProperty('opacity');
      clearMask(frontEl);
      clearMask(revealEl);
    };
  }, [stage, flower, front, reveal]);
}
