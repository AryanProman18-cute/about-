import { useEffect, useRef, type ReactNode } from 'react';

interface MagnetProps {
  children: ReactNode;
  /** Distance (px) beyond the element's edge at which the magnet engages. */
  padding?: number;
  /** Higher value = weaker pull (offset is divided by strength). */
  strength?: number;
  /** Per-frame lerp factor (0–1). Lower = smoother, floatier follow. */
  ease?: number;
  /** Vertical bob amplitude (px) on pointer devices while the cursor is idle. */
  floatAmplitude?: number;
  /** Duration of one full up-down float cycle, in ms. */
  floatPeriod?: number;
  /** How long the cursor must be still before the float fades in (ms). */
  floatDelay?: number;
  className?: string;
  innerClassName?: string;
}

/**
 * Premium, calm magnetic hover with a subtle idle float.
 *
 * Cursor moving → the element follows the cursor (the existing parallax
 * pull, unchanged). Cursor still (or no cursor at all) → the pull gently
 * settles back to center and the element "floats": a slow, tiny sine bob on
 * the Y axis. Both the settle-back and the bob are blended with exponential
 * weights inside a single rAF loop, so there are never any jumps or sudden
 * direction changes, the motion is continuous by construction.
 *
 * Touch devices (no cursor) float continuously; their amplitude is scaled
 * down and the cycle slowed, so the motion reads as gentle rather than
 * excessive on small screens. Users who prefer reduced motion get no bob.
 */
export default function Magnet({
  children,
  padding = 100,
  strength = 2,
  ease = 0.11,
  floatAmplitude = 5,
  floatPeriod = 3800,
  floatDelay = 700,
  className = '',
  innerClassName = '',
}: MagnetProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const active = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    // Respect users who ask the OS for reduced motion: magnet still works,
    // the idle bob is switched off.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // Touch devices have no cursor: they float continuously, gentler and
    // slower than desktop so it never feels excessive on a small screen.
    const touch =
      window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ?? false;
    const amp = reduced ? 0 : touch ? floatAmplitude * 0.6 : floatAmplitude;
    const period = touch ? Math.round(floatPeriod * 1.3) : floatPeriod;

    let phase = 0; // float sine phase, advances every frame
    let floatWeight = 0; // 0 = magnet only, 1 = full idle bob
    let lastInputAt = -Infinity; // no input yet → floats from first paint
    let lastT = 0; // previous frame timestamp

    const apply = (x: number, y: number) => {
      if (!innerRef.current) return;
      innerRef.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };

    const loop = (now: number) => {
      const c = current.current;
      const t = target.current;

      // dt-clamped so a background-tab pause never causes a lurch
      const dt = lastT ? Math.min(64, now - lastT) : 16.7;
      lastT = now;

      const idle = now - lastInputAt > floatDelay;

      // --- cursor-follow (parallax) ---
      // While the cursor moves, the pull tracks it exactly as before.
      // Once the cursor has been still, the pull eases itself back to the
      // centre so the model "settles back into" the floating animation.
      if (idle && !reduced) {
        const settle = 1 - Math.exp(-dt / 800); // ~2s graceful return
        t.x += (0 - t.x) * settle;
        t.y += (0 - t.y) * settle;
      }
      c.x += (t.x - c.x) * ease;
      c.y += (t.y - c.y) * ease;

      // --- idle float ---
      phase += (dt * Math.PI * 2) / period;
      const k = 1 - Math.exp(-dt / 600); // ~600ms blend time constant
      floatWeight += ((idle ? 1 : 0) - floatWeight) * k;
      const floatY = amp * floatWeight * Math.sin(phase);

      apply(c.x, c.y + floatY);

      if (amp > 0 || !reduced) {
        // the float never settles, keep the loop alive
        raf.current = requestAnimationFrame(loop);
        return;
      }
      if (active.current || Math.abs(t.x - c.x) > 0.05 || Math.abs(t.y - c.y) > 0.05) {
        raf.current = requestAnimationFrame(loop);
      } else {
        c.x = 0;
        c.y = 0;
        apply(0, 0);
        raf.current = null;
      }
    };

    const start = () => {
      if (raf.current === null) raf.current = requestAnimationFrame(loop);
    };

    const evaluate = (mx: number, my: number) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.abs(mx - cx);
      const dy = Math.abs(my - cy);

      if (dx < rect.width / 2 + padding && dy < rect.height / 2 + padding) {
        active.current = true;
        target.current.x = (mx - cx) / strength;
        target.current.y = (my - cy) / strength;
      } else {
        active.current = false;
        target.current.x = 0;
        target.current.y = 0;
      }
      start();
    };

    let lastMouse: { x: number; y: number } | null = null;
    const onMouseMove = (e: MouseEvent) => {
      lastInputAt = performance.now();
      lastMouse = { x: e.clientX, y: e.clientY };
      evaluate(e.clientX, e.clientY);
    };
    // Keep the pull accurate while the page scrolls under a cursor that is
    // being used; a long-idle cursor stays in floating mode instead.
    const onScroll = () => {
      if (lastMouse && performance.now() - lastInputAt <= floatDelay) {
        evaluate(lastMouse.x, lastMouse.y);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    start(); // begin the idle float immediately (also covers touch devices)
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
  }, [padding, strength, ease, floatAmplitude, floatPeriod, floatDelay]);

  return (
    <div ref={outerRef} className={className} style={{ position: 'relative' }}>
      <div ref={innerRef} className={innerClassName} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}
