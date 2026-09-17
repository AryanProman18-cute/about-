import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import FadeIn from '../components/FadeIn';
import LiveProjectButton from '../components/LiveProjectButton';

interface Project {
  number: string;
  category: string;
  name: string;
  tech: string;
  description: string;
  /** Live URL, when absent, no CTA button is rendered. */
  link?: string;
  img1: string;
  img2: string;
  img3: string;
}

const PROJECTS: Project[] = [
  {
    number: '01',
    category: 'Full Stack · Personal',
    name: 'Prepwise',
    tech: 'Next.js · FastAPI · Groq · FAISS · Supabase',
    description:
      'AI interview platform grounded in university syllabus, custom RAG pipeline, voice + text interviews, real-time scoring, and structured study mode.',
    link: 'https://prepwise-mocha.vercel.app',
    img1: '/projects/prepwise-1.jpg',
    img2: '/projects/prepwise-2.jpg',
    img3: '/projects/prepwise-3.jpg',
  },
  {
    number: '02',
    category: 'Android · Production',
    name: 'Roll Call',
    tech: 'Java · Android SDK · Room DB · MVVM',
    description:
      'Smart attendance tracker live on the Play Store, tracks attendance, predicts safe skips, and maintains your target percentage with a clean, minimal UI.',
    link: 'https://play.google.com/store/apps/details?id=com.suyash.rollcall',
    img1: '/projects/rollcall-1.jpg',
    img2: '/projects/rollcall-2.jpg',
    img3: '/projects/rollcall-3.jpg',
  },
  {
    number: '03',
    category: 'Full Stack · Team Project',
    name: 'ClinicGo',
    tech: '.NET · Java · React · PostgreSQL · SignalR',
    description:
      'Smart clinic management platform built with a 3-person team, patient & staff Android apps, a React admin/doctor portal, and a .NET REST API with SignalR real-time chat.',
    link: 'https://clinic-go-ivory.vercel.app/login',
    img1: '/projects/clinicgo-1.jpg',
    img2: '/projects/clinicgo-2.jpg',
    img3: '/projects/clinicgo-3.jpg',
  },
  {
    number: '04',
    category: 'Client Work · Live Site',
    name: 'Nrityarpan',
    tech: 'Vite · React · TypeScript · Tailwind · Supabase',
    description:
      'Full digital presence for a Kathak dance studio in Indore, public landing page plus a private admin dashboard for students, batches, attendance, fees, and events.',
    link: 'https://www.nrityarpan.com',
    img1: '/projects/nrityarpan-1.jpg',
    img2: '/projects/nrityarpan-2.jpg',
    img3: '/projects/nrityarpan-3.jpg',
  },
  {
    number: '05',
    category: 'Mobile · Offline-First',
    name: 'Vahan Vault',
    tech: 'Flutter · Riverpod · Drift',
    description:
      'Offline-first vehicle document manager, RC, insurance, PUC and license storage with smart expiry tracking, reminders, and biometric security.',
    link: 'https://github.com/SuyashVJain/vahan_vault',
    img1: '/projects/vahanvault-1.jpg',
    img2: '/projects/vahanvault-2.jpg',
    img3: '/projects/vahanvault-3.jpg',
  },
];

interface ProjectCardProps {
  project: Project;
  index: number;
  totalCards: number;
  progress: MotionValue<number>;
}

function ProjectCard({ project, index, totalCards, progress }: ProjectCardProps) {
  // Earlier cards shrink a little more than later ones.
  const targetScale = 1 - (totalCards - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / totalCards, 1], [1, targetScale]);

  return (
    <div className="sticky top-24 h-[85vh] md:top-32">
      <motion.div
        className="relative rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
        style={{ scale, top: `${index * 24}px`, transformOrigin: 'top center' }}
      >
        {/* Top row: number, meta + name + stack, CTA */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:mb-5">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6 md:gap-8">
            <span
              className="shrink-0 font-black leading-none text-[#FFFFFF]"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {project.number}
            </span>
            <div className="min-w-0">
              <span className="block text-xs font-medium uppercase tracking-widest text-[#FFFFFF]/60 sm:text-sm">
                {project.category}
              </span>
              <h3
                className="font-medium uppercase leading-tight text-[#FFFFFF]"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {project.name}
              </h3>
              <span className="mt-1 block max-w-xl truncate text-[10px] font-light uppercase tracking-wider text-[#FFFFFF]/50 sm:text-xs">
                {project.tech}
              </span>
            </div>
          </div>
          <LiveProjectButton label="View Project" href={project.link} className="shrink-0" />
        </div>

        {/* Image grid: 2 stacked tiles (40%) + 1 tall tile (60%) */}
        <div className="flex gap-3 sm:gap-4">
          <div className="flex w-[40%] flex-col gap-3 sm:gap-4">
            <img
              src={project.img1}
              alt={`${project.name} preview 1`}
              decoding="async"
              draggable={false}
              className="w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(110px, 13vw, 185px)' }}
            />
            <img
              src={project.img2}
              alt={`${project.name} preview 2`}
              decoding="async"
              draggable={false}
              className="w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(135px, 17vw, 260px)' }}
            />
          </div>
          <div className="relative w-[60%]">
            <img
              src={project.img3}
              alt={`${project.name} preview 3`}
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
            />
          </div>
        </div>

        {/* One-line summary */}
        <p className="mt-4 line-clamp-2 text-sm font-light leading-relaxed text-[#FFFFFF]/70 sm:mt-5 sm:text-base">
          {project.description}
        </p>
      </motion.div>
    </div>
  );
}

export default function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const totalCards = PROJECTS.length;

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-4 pb-20 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-6 sm:pb-24 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pb-32 md:pt-32"
    >
      <FadeIn
        as="h2"
        y={40}
        className="hero-heading mb-10 text-center font-black uppercase leading-none tracking-tight sm:mb-14 md:mb-16"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Projects
      </FadeIn>

      <div ref={containerRef} className="relative">
        {PROJECTS.map((project, index) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={index}
            totalCards={totalCards}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}
