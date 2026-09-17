import AnimatedText from '../components/AnimatedText';
import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';

const ABOUT_TEXT =
  "i\u2019m suyash vasal jain, a full stack developer and computer science student at symbiosis university, indore. i build production-ready systems (rag pipelines, scalable backends, and clean responsive frontends) and run a freelance practice building production sites for local businesses. i care about performance, structure, and products that actually deliver value. let\u2019s build something incredible together!";

const HIGHLIGHTS = [
  'B.Tech CS & IT · Symbiosis University · CGPA 8.94',
  'Full Stack Developer Intern · I-SoftZone, Indore',
  'ACM Chairperson · IEEE Secretary · SUAS',
  'SIH 2025 Internal Winner · 5+ Live Apps in Production',
];

const DECOR_IMAGES = {
  moon: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png',
  p59: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png',
  lego: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png',
  group:
    'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png',
};

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-5 py-20 sm:gap-14 sm:px-8 md:gap-16 md:px-10"
    >
      {/* Decorative 3D corner objects */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="hidden lg:block absolute left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px] lg:left-[1%] lg:w-[150px] min-[1440px]:left-[4%] min-[1440px]:w-[210px]"
      >
        <img src={DECOR_IMAGES.moon} alt="3D moon icon" className="h-auto w-full" draggable={false} />
      </FadeIn>
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="hidden lg:block absolute bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px] lg:left-[2%] lg:w-[120px] min-[1440px]:left-[10%] min-[1440px]:w-[180px]"
      >
        <img src={DECOR_IMAGES.p59} alt="3D abstract object" className="h-auto w-full" draggable={false} />
      </FadeIn>
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="hidden lg:block absolute right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px] lg:right-[1%] lg:w-[150px] min-[1440px]:right-[4%] min-[1440px]:w-[210px]"
      >
        <img src={DECOR_IMAGES.lego} alt="3D lego icon" className="h-auto w-full" draggable={false} />
      </FadeIn>
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="hidden lg:block absolute bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px] lg:right-[2%] lg:w-[140px] min-[1440px]:right-[10%] min-[1440px]:w-[220px]"
      >
        <img src={DECOR_IMAGES.group} alt="3D shapes group" className="h-auto w-full" draggable={false} />
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
