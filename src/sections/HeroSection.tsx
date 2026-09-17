import { useEffect, useRef, type CSSProperties, type MouseEvent } from 'react';
import FadeIn from '../components/FadeIn';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function HeroSection() {
  const lilyWrapRef = useRef<HTMLDivElement>(null);
  const lilyRevealRef = useRef<HTMLImageElement>(null);

  // Cursor trail reveal: the warm "reveal" lily is masked to a soft circle
  // that follows the pointer (eased, so it trails gently). Touch devices
  // never fire mousemove, so they simply keep the front bloom.
  useEffect(() => {
    const wrap = lilyWrapRef.current;
    const reveal = lilyRevealRef.current;
    if (!wrap || !reveal) return;

    let lastX: number | null = null;
    let lastY: number | null = null;
    let tx = -1200;
    let ty = -1200;
    let cx = -1200;
    let cy = -1200;
    let raf: number | null = null;

    const onMove = (e: globalThis.MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const loop = () => {
      if (lastX !== null && lastY !== null) {
        const r = wrap.getBoundingClientRect();
        tx = lastX - r.left;
        ty = lastY - r.top;
      }
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      reveal.style.setProperty('--reveal-x', `${cx.toFixed(1)}px`);
      reveal.style.setProperty('--reveal-y', `${cy.toFixed(1)}px`);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // Programmatic smooth scroll, works everywhere, including sandboxed
  // preview iframes where default hash navigation can be blocked.
  const handleNavClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex h-screen flex-col overflow-clip">
      {/* Themed hero backdrop, pixel-art field, edge to edge */}
      <img
        src="/assets/hero-bg4.png"
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover"
      />
      {/* Accessibility veil: gently dims the field so the white type stays
          comfortably readable. The lily and all content sit above it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      />

      {/* Pixel-art lily, the hero centrepiece, large enough to cover the
          hero (artfully overlapping the giant heading). The pink/violet
          bloom is always visible; the warm coral bloom appears only inside
          the cursor's soft trail. */}
      <div className="pointer-events-none absolute inset-x-0 top-[8vh] z-[1] flex justify-center">
        <FadeIn delay={0.6} y={30}>
          <div ref={lilyWrapRef} className="relative h-auto w-full lg:h-[104.88vh] lg:w-auto">
            <img
              src="/assets/lily-front.png"
              alt="Pixel-art pink and violet lily"
              draggable={false}
              className="h-auto w-full select-none lg:h-full lg:w-auto"
            />
            <img
              ref={lilyRevealRef}
              src="/assets/lily-reveal.png"
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover"
              style={
                {
                  '--reveal-x': '-1200px',
                  '--reveal-y': '-1200px',
                  WebkitMaskImage:
                    'radial-gradient(circle 300px at var(--reveal-x) var(--reveal-y), #000 0%, #000 30%, transparent 72%)',
                  maskImage:
                    'radial-gradient(circle 300px at var(--reveal-x) var(--reveal-y), #000 0%, #000 30%, transparent 72%)',
                } as CSSProperties
              }
            />
          </div>
        </FadeIn>
      </div>

      {/* Navbar */}
      <FadeIn
        as="nav"
        delay={0}
        y={-20}
        className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={handleNavClick(link.href)}
            className="text-sm font-medium uppercase tracking-wider text-[#FFFFFF] transition-opacity duration-200 hover:opacity-70 md:text-lg lg:text-[1.4rem]"
          >
            {link.label}
          </a>
        ))}
      </FadeIn>

      {/* Giant heading */}
      <div className="w-full overflow-hidden">
        <FadeIn
          as="h1"
          delay={0.15}
          y={40}
          className="hero-heading mt-6 w-full whitespace-nowrap text-center text-[12.5vw] font-black uppercase leading-none tracking-tight sm:mt-4 sm:text-[13vw] md:-mt-5 md:text-[13.6vw] lg:text-[14.2vw]"
        >
          Hi, i&rsquo;m suyash
        </FadeIn>
      </div>

      {/* Bottom bar */}
      <div className="mt-auto flex items-end px-6 pb-7 sm:pb-8 md:px-10 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <p
            className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#FFFFFF] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            a full stack developer driven by crafting striking and unforgettable projects
          </p>
        </FadeIn>
      </div>

    </section>
  );
}
