import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';

const ABOUT_TEXT =
  "I\u2019m Suyash Vasal Jain, a full stack developer and computer science student at Symbiosis University, Indore. I build production-ready systems (RAG pipelines, scalable backends, and clean responsive frontends) and run a freelance practice building production sites for local businesses. I care about performance, structure, and products that actually deliver value. Let\u2019s build something incredible together!";

const HIGHLIGHTS = [
  'B.Tech CS & IT · Symbiosis University · CGPA 8.94',
  'Full Stack Developer Intern · I-SoftZone, Indore',
  'ACM Chairperson · IEEE Secretary · SUAS',
  'SIH 2025 Internal Winner · 5+ Live Apps in Production',
];

const DECOR_IMAGES = {
  moon: '/assets/decor/moon.png',
  p59: '/assets/decor/p59.png',
  lego: '/assets/decor/lego.png',
  group:
    '/assets/decor/group.png',
};

// Height-driven sizing keeps all four icons the same visual height at each
// breakpoint (64px phones up to 150px on big desktops).
const DECOR_SIZE =
  'h-[64px] w-auto sm:h-[84px] md:h-[100px] lg:h-[115px] xl:h-[130px] min-[1440px]:h-[150px]';

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-5 py-20 sm:gap-14 sm:px-8 md:gap-16 md:px-10"
    >
      {/* Decorative 3D corner objects. All four PNGs are pre-cropped to their
          artwork bounds and sized by height, so the top pair shares one
          baseline and the bottom pair shares another, at every breakpoint. */}
      <FadeIn delay={0.1} x={-80} y={0} duration={0.9} className="absolute left-[4%] top-[1.5%] md:top-[4%]">
        <img src={DECOR_IMAGES.moon} alt="3D moon icon" className={DECOR_SIZE} draggable={false} />
      </FadeIn>
      <FadeIn delay={0.25} x={-80} y={0} duration={0.9} className="absolute bottom-[1.5%] left-[6%] md:bottom-[8%] md:left-[10%]">
        <img src={DECOR_IMAGES.p59} alt="3D abstract object" className={DECOR_SIZE} draggable={false} />
      </FadeIn>
      <FadeIn delay={0.15} x={80} y={0} duration={0.9} className="absolute right-[4%] top-[1.5%] md:top-[4%]">
        <img src={DECOR_IMAGES.lego} alt="3D lego icon" className={DECOR_SIZE} draggable={false} />
      </FadeIn>
      <FadeIn delay={0.3} x={80} y={0} duration={0.9} className="absolute bottom-[1.5%] right-[6%] md:bottom-[8%] md:right-[10%]">
        <img src={DECOR_IMAGES.group} alt="3D shapes group" className={DECOR_SIZE} draggable={false} />
      </FadeIn>

      {/* Heading */}
      <FadeIn
        as="h2"
        delay={0}
        y={40}
        className="hero-heading text-center font-black uppercase leading-none tracking-tight"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        About me
      </FadeIn>

      {/* Bio, highlights, CTA */}
      <div className="flex flex-col items-center gap-10 sm:gap-12 md:gap-14">
        <AnimatedText
          text={ABOUT_TEXT}
          className="max-w-[560px] text-center font-medium leading-relaxed text-[#FFFFFF]"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
        />

        <FadeIn
          delay={0.15}
          className="flex max-w-2xl flex-wrap items-center justify-center gap-2.5 sm:gap-3"
        >
          {HIGHLIGHTS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#D7E2EA]/25 px-4 py-2 text-center text-[10px] font-light uppercase tracking-widest text-[#FFFFFF]/75 sm:text-xs md:px-5 md:py-2.5"
            >
              {item}
            </span>
          ))}
        </FadeIn>

        <ContactButton
          href="mailto:suyashvasaljain09@gmail.com"
          className="mt-4 sm:mt-6 md:mt-8"
        />
      </div>
    </section>
  );
}
