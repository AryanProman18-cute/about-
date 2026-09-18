import { useToast } from './Toast';
import { externalLinkFallback } from '../utils/clipboard';

interface LiveProjectButtonProps {
  label?: string;
  className?: string;
  href?: string;
}

/**
 * Ghost/outline pill used on project cards. Opens external links in a new
 * tab; when the environment blocks that (sandboxed preview), it copies the
 * link and confirms with a toast so the click is never dead.
 */
export default function LiveProjectButton({
  label = 'Live Project',
  className = '',
  href,
}: LiveProjectButtonProps) {
  const toast = useToast();

  if (!href) return null;

  const external = href.startsWith('http');

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={() => external && externalLinkFallback(href, 'project', toast)}
      data-magnetic
      className={`cursor-pointer rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#FFFFFF] transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base ${className}`}
    >
      {label}
    </a>
  );
}
