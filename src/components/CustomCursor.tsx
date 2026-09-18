import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Custom animated cursor for desktop.
 *
 * A small pure white dot sits exactly on the pointer, and a thin white ring
 * trails it with elegant inertia (GSAP quickTo, power3.out / expo.out). The
 * dot and the ring never intercept clicks (pointer-events: none, transforms
 * only, will-change: transform), so every element keeps working as before.
 *
 * Hovering interactive elements (links, buttons, cards, images) smoothly
 * expands the ring about 1.55x, lifts its opacity slightly and shrinks the
 * dot. Buttons marked data-magnetic additionally draw the cursor gently
 * toward their centre, which reads as a subtle magnetic pull.
 *
 * Any device that has a real mouse (including touch-primary hybrids) gets
 * the cursor; pure touch devices and visitors who prefer reduced motion
 * keep the native cursor. If anything fails at startup the native cursor
 * is handed straight back.
 */

/** Elements that light the cursor up: links, buttons, cards, images. */
const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label, img, video, [data-cursor="hover"]';

/** Elements the cursor is gently drawn toward (primary action buttons). */
const MAGNETIC = '[data-magnetic]';

const DOT_FOLLOW = 0.16; // near immediate, still buttery
const RING_FOLLOW = 0.55; // elegant trailing lag
const RING_EXPAND = 1.55; // 1.4x to 1.7x per spec
const RING_OPACITY_REST = 0.55;
const RING_OPACITY_HOVER = 0.85;
const DOT_SCALE_HOVER = 0.55;
const DOT_PULL = 0.3; // how strongly the dot gravitates to magnetic buttons
const RING_PULL = 0.12; // the ring follows that pull more loosely

// Tiny diagnostics handle so the cursor state can be inspected in devtools.
declare global {
  interface Window {
    __customCursorActive?: boolean;
  }
}

/** Installs all cursor behaviour on the two marker divs, returns cleanup. */
function start(dot: HTMLDivElement, ring: HTMLDivElement): () => void {
  document.documentElement.classList.add('custom-cursor');

  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -200, y: -200, autoAlpha: 0 });

  const dotX = gsap.quickTo(dot, 'x', { duration: DOT_FOLLOW, ease: 'power3.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: DOT_FOLLOW, ease: 'power3.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: RING_FOLLOW, ease: 'expo.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: RING_FOLLOW, ease: 'expo.out' });

  let shown = false;
  let hovering = false;
  let magnet: HTMLElement | null = null;
  let mx = 0;
  let my = 0;

  const moveTo = (x: number, y: number) => {
    mx = x;
    my = y;
    // Magnetic buttons blend the cursor targets toward their centre.
    let dx = mx;
    let dy = my;
    let rx = mx;
    let ry = my;
    if (magnet) {
      const rect = magnet.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      dx = mx + (cx - mx) * DOT_PULL;
      dy = my + (cy - my) * DOT_PULL;
      rx = mx + (cx - mx) * RING_PULL;
      ry = my + (cy - my) * RING_PULL;
    }
    if (!shown) {
      // First appearance: land exactly on the pointer, no fly-in sweep.
      shown = true;
      gsap.set(dot, { x: dx, y: dy });
      gsap.set(ring, { x: rx, y: ry });
      gsap.set([dot, ring], { visibility: 'visible' });
      gsap.to(dot, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(ring, {
        opacity: hovering ? RING_OPACITY_HOVER : RING_OPACITY_REST,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
    dotX(dx);
    dotY(dy);
    ringX(rx);
    ringY(ry);
  };

  const setHover = (next: boolean) => {
    if (next === hovering) return;
    hovering = next;
    gsap.to(ring, {
      scale: next ? RING_EXPAND : 1,
      opacity: next ? RING_OPACITY_HOVER : RING_OPACITY_REST,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    });
    gsap.to(dot, {
      scale: next ? DOT_SCALE_HOVER : 1,
      duration: 0.3,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  };

  const onMove = (e: globalThis.MouseEvent) => moveTo(e.clientX, e.clientY);

  const onOver = (e: globalThis.MouseEvent) => {
    // Hover state only matters once a real mousemove has shown the cursor;
    // Chrome also fires phantom mouseover events at page load under a
    // stationary pointer, which must never summon the cursor by themselves.
    if (!shown) return;
    const target = e.target;
    if (!(target instanceof Element)) return;
    setHover(!!target.closest(INTERACTIVE));
    magnet = (target.closest(MAGNETIC) as HTMLElement | null) ?? null;
    moveTo(e.clientX, e.clientY);
  };

  const hide = () => {
    shown = false;
    gsap.to([dot, ring], { autoAlpha: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
  };

  // When the page scrolls under a stationary pointer, the element beneath
  // it changes without any mouse event. Refresh the hover and magnet state
  // from the actual hit test, so the ring never stays expanded over an
  // element that has scrolled away (and the pull follows its button).
  let refreshQueued = false;
  const refreshUnderPointer = () => {
    refreshQueued = false;
    if (!shown) return;
    const el = document.elementFromPoint(mx, my);
    if (!(el instanceof Element)) return;
    setHover(!!el.closest(INTERACTIVE));
    magnet = (el.closest(MAGNETIC) as HTMLElement | null) ?? null;
    moveTo(mx, my);
  };
  const onScroll = () => {
    if (!refreshQueued) {
      refreshQueued = true;
      requestAnimationFrame(refreshUnderPointer);
    }
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseover', onOver, { passive: true });
  document.documentElement.addEventListener('mouseleave', hide);
  window.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseover', onOver);
    document.documentElement.removeEventListener('mouseleave', hide);
    window.removeEventListener('scroll', onScroll);
    document.documentElement.classList.remove('custom-cursor');
    gsap.killTweensOf([dot, ring]);
  };
}

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Any device that has a real mouse (including touch-primary hybrids)
    // gets the custom cursor; pure touch devices keep the native one.
    if (!window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches) return;
    // Reduced motion visitors keep the native cursor as well.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let dispose: (() => void) | null = null;
    try {
      dispose = start(dot, ring);
    } catch {
      // If anything at all goes wrong, hand the native cursor back.
      document.documentElement.classList.remove('custom-cursor');
      window.__customCursorActive = false;
      return;
    }
    window.__customCursorActive = true;
    return () => {
      window.__customCursorActive = false;
      if (dispose) dispose();
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 will-change-transform rounded-full bg-[#FFFFFF]"
        style={{ opacity: 0, visibility: 'hidden', filter: 'drop-shadow(0 0 2px rgba(10, 10, 12, 0.55))' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-9 w-9 will-change-transform rounded-full border-[1.5px] border-[#FFFFFF]"
        style={{ opacity: 0, visibility: 'hidden', filter: 'drop-shadow(0 0 2px rgba(10, 10, 12, 0.45))' }}
      />
    </>
  );
}
