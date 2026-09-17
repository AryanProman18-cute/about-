import { useEffect, useRef, useState } from 'react';

/**
 * Marquee images, real screenshots of Suyash's own sites and projects
 * (portfolio, Prepwise, Nrityarpan, Roll Call, ClinicGo, Vahan Vault).
 */
const MARQUEE_IMAGES = Array.from(
  { length: 21 },
  (_, i) => `/marquee/m${String(i + 1).padStart(2, '0')}.jpg`
);

const TILE_WIDTH = 420;
const GAP = 12;

interface MarqueeRowProps {
  images: string[];
  translateX: number;
}

function MarqueeRow({ images, translateX }: MarqueeRowProps) {
  // Tripled for a seamless, never-ending strip.
  const tripled = [...images, ...images, ...images];
  // Shift the strip left by exactly one tile set: the pattern is periodic,
  // so the strip keeps covering the viewport at any scroll offset.
  const baseOffset = -(images.length * (TILE_WIDTH + GAP));

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none flex w-max select-none gap-3"
      style={{
        marginLeft: baseOffset,
        transform: `translateX(${translateX}px)`,
        willChange: 'transform',
      }}
    >
      {tripled.map((src, i) => (
        <img
          key={`${i}-${src}`}
          src={src}
          alt=""
          decoding="async"
          draggable={false}
          className="h-[270px] w-[420px] shrink-0 rounded-2xl object-cover"
        />
      ))}
    </div>
  );
}

/**
 * Two rows of project screenshots that slide in opposite directions, driven
 * by the page scroll position.
 */
export default function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const sectionTop = el.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const rowOne = MARQUEE_IMAGES.slice(0, 11);
  const rowTwo = MARQUEE_IMAGES.slice(11);

  return (
    <section ref={sectionRef} className="overflow-hidden pb-10 pt-24 sm:pt-32 md:pt-40">
      <div className="flex flex-col gap-3">
        {/* Row 1, moves right as you scroll down */}
        <MarqueeRow images={rowOne} translateX={offset - 200} />
        {/* Row 2, moves left as you scroll down */}
        <MarqueeRow images={rowTwo} translateX={-(offset - 200)} />
      </div>
    </section>
  );
}
