import { FileText, Github, Globe, Linkedin, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import type { MouseEvent } from 'react';
import ContactButton from '../components/ContactButton';
import FadeIn from '../components/FadeIn';
import { useToast } from '../components/Toast';
import { copyToClipboard, externalLinkFallback } from '../utils/clipboard';

interface ContactItem {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string;
}

const RESUME_URL = 'https://suyashvjain.web.app/Suyash_Jain_Resume.pdf';

const CONTACT_ITEMS: ContactItem[] = [
  {
    icon: Mail,
    label: 'Email',
    value: 'suyashvasaljain09@gmail.com',
    href: 'mailto:suyashvasaljain09@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 93433 79736',
    href: 'tel:+919343379736',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Indore, Madhya Pradesh, India',
    href: 'https://maps.google.com/?q=Indore,+Madhya+Pradesh,+India',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/suyashvasal',
    href: 'https://www.linkedin.com/in/suyashvasal',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/SuyashVJain',
    href: 'https://github.com/SuyashVJain',
  },
  {
    icon: Globe,
    label: 'Portfolio',
    value: 'suyashvjain.web.app',
    href: 'https://suyashvjain.web.app',
  },
];

export default function ContactSection() {
  const toast = useToast();

  // Every card gives feedback: mail/phone values are copied instantly, and
  // web links fall back to copy + toast when the environment blocks popups
  // (e.g. the sandboxed preview iframe).
  const handleCardClick = (item: ContactItem) => (_e: MouseEvent<HTMLAnchorElement>) => {
    if (item.href.startsWith('mailto:') || item.href.startsWith('tel:')) {
      copyToClipboard(item.value);
      toast(`${item.label.toLowerCase()} copied: ${item.value}`);
    } else {
      externalLinkFallback(item.href, item.label.toLowerCase(), toast);
    }
  };

  return (
    <section
      id="contact"
      className="relative px-5 pb-8 pt-20 sm:px-8 sm:pt-24 md:px-10 md:pt-32"
    >
      <div className="flex flex-col items-center gap-10 sm:gap-12 md:gap-16">
        <FadeIn
          as="h2"
          y={40}
          className="hero-heading text-center font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Contact
        </FadeIn>

        <FadeIn delay={0.1}>
          <p
            className="max-w-xl text-center font-light leading-relaxed text-[#FFFFFF]"
            style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.3rem)' }}
          >
            have a project in mind, an opportunity to discuss, or just want to say hi? my inbox is
            always open, let&rsquo;s build something incredible together!
          </p>
        </FadeIn>

        <FadeIn
          delay={0.2}
          className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          {CONTACT_ITEMS.map((item) => {
            const Icon = item.icon;
            const external = item.href.startsWith('http');
            return (
              <a
                key={item.label}
                href={item.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                onClick={handleCardClick(item)}
                className="group flex items-center gap-4 rounded-[28px] border-2 border-[#D7E2EA]/20 bg-[#0C0C0C] p-5 transition-colors duration-300 hover:border-[#D7E2EA]/60 sm:gap-5 sm:p-6"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D7E2EA]/30 text-[#FFFFFF] transition-colors duration-300 group-hover:border-[#D7E2EA]/70 sm:h-12 sm:w-12">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[#FFFFFF]/50 sm:text-xs">
                    {item.label}
                  </span>
                  <span className="truncate text-sm font-medium text-[#FFFFFF] sm:text-base">
                    {item.value}
                  </span>
                </span>
              </a>
            );
          })}
        </FadeIn>

        <FadeIn delay={0.3}>
          <ContactButton label="Say Hello" href="mailto:suyashvasaljain09@gmail.com" />
        </FadeIn>
      </div>

      <footer className="mt-16 flex flex-col items-center gap-3 border-t border-[#D7E2EA]/10 pt-6 text-center text-xs font-normal uppercase tracking-wider text-[#FFFFFF]/80 sm:mt-20 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:text-left sm:text-sm md:pt-8">
        <span className="sm:justify-self-start">&copy; 2026 Suyash Vasal Jain</span>
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noreferrer"
          onClick={() => externalLinkFallback(RESUME_URL, 'resume', toast)}
         
          className="inline-flex items-center gap-1.5 rounded-full border border-[#D7E2EA]/40 px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-[#FFFFFF] transition-colors duration-200 hover:border-[#D7E2EA]/90 hover:bg-[#FFFFFF]/10 sm:text-xs"
        >
          <FileText size={14} strokeWidth={1.8} />
          Resume
        </a>
        <span className="sm:justify-self-end sm:text-right">Indore, Madhya Pradesh, India</span>
      </footer>
    </section>
  );
}
