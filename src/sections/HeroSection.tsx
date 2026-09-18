import { useRef, type MouseEvent } from 'react';
import FadeIn from '../components/FadeIn';
import { useMorphTrail } from '../components/MorphTrail';

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function HeroSection() {
  const stageRef = useRef<HTMLElement>(null);
  const lilyWrapRef = useRef<HTMLDivElement>(null);
  const lilyFrontRef = useRef<HTMLImageElement>(null);
  const lilyRevealRef = useRef<HTMLImageElement>(null);

  // Morphing blob trail: the cursor wipes organic holes through the front
  // bloom and paints the warm bloom inside the same shapes. Touch devices
  // never fire mousemove, so they simply keep the front bloom.
  useMorphTrail({
    stage: stageRef,
    flower: lilyWrapRef,
    front: lilyFrontRef,
    reveal: lilyRevealRef,
  });

  // Programmatic smooth scroll, works everywhere, including sandboxed
  // preview iframes where default hash navigation can be blocked.
  const handleNavClick = (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={stageRef} className="relative flex h-screen flex-col overflow-clip">
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
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] flex -translate-y-1/2 justify-center lg:top-[8vh] lg:translate-y-0">
        <FadeIn delay={0.6} y={30}>
          <div ref={lilyWrapRef} className="relative h-auto w-full lg:h-[104.88vh] lg:w-auto">
            <img
              ref={lilyFrontRef}
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
              style={{ opacity: 0 }}
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
