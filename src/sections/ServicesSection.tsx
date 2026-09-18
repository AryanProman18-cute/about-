import FadeIn from '../components/FadeIn';

const SERVICES = [
  {
    number: '01',
    name: 'Full Stack Development',
    description:
      'End-to-end web applications with React.js, Next.js, Node.js and Express, from pixel-perfect frontends to scalable backend architecture and REST APIs.',
  },
  {
    number: '02',
    name: 'Mobile Development',
    description:
      'Cross-platform apps with Flutter and React Native, offline-first AI tutors, attendance trackers, and safety platforms with live GPS tracking and SOS alerts.',
  },
  {
    number: '03',
    name: 'AI & RAG Solutions',
    description:
      'Intelligent products powered by LLMs, FAISS semantic search, vector embeddings, RAG pipelines, and real-time scoring with Groq and Gemma 3 models.',
  },
  {
    number: '04',
    name: 'Backend & Databases',
    description:
      'Robust APIs and data layers with FastAPI, .NET, MySQL, PostgreSQL and Supabase, optimized queries, real-time sync, JWT auth, and SignalR real-time chat.',
  },
  {
    number: '05',
    name: 'UI/UX & Design',
    description:
      'Clean, conversion-focused interfaces designed in Figma with attention to layout, typography, and user experience, grounded in Enterprise Design Thinking.',
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="rounded-t-[40px] bg-[#FFFFFF] px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
      style={{
        // Scattered black "starfield" dots: three offset dot grids at
        // incommensurate spacings, so the pattern never reads as a grid.
        backgroundImage: [
          'radial-gradient(circle, rgba(12,12,12,0.32) 1.3px, transparent 1.4px)',
          'radial-gradient(circle, rgba(12,12,12,0.20) 1.1px, transparent 1.2px)',
          'radial-gradient(circle, rgba(12,12,12,0.12) 0.9px, transparent 1.0px)',
        ].join(', '),
        backgroundSize: '56px 56px, 37px 37px, 23px 23px',
        backgroundPosition: '3px 7px, 21px 33px, 11px 16px',
      }}
    >
      <FadeIn
        as="h2"
        y={40}
        className="mb-16 text-center font-black uppercase leading-none tracking-tight text-[#0C0C0C] sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Services
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {SERVICES.map((service, i) => (
          <FadeIn
            key={service.number}
            delay={i * 0.1}
            className={`flex items-baseline gap-6 py-8 sm:gap-8 sm:py-10 md:gap-12 md:py-12 ${
              i > 0 ? 'border-t border-[rgba(12,12,12,0.15)]' : ''
            }`}
          >
            <span
              className="shrink-0 font-black leading-none text-[#0C0C0C]"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {service.number}
            </span>
            <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
              <h3
                className="font-medium uppercase leading-tight text-[#0C0C0C]"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {service.name}
              </h3>
              <p
                className="max-w-2xl font-light leading-relaxed text-[#0C0C0C] opacity-60"
                style={{ fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
              >
                {service.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
