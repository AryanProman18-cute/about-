import { useToast } from './Toast';
import { copyToClipboard } from '../utils/clipboard';

interface ContactButtonProps {
  label?: string;
  className?: string;
  href?: string;
}

const BASE_CLASS =
  'cursor-pointer rounded-full px-8 py-3 text-xs font-medium uppercase tracking-widest text-white sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base';

const BUTTON_STYLE: React.CSSProperties = {
  // New theme: deep violet-navy → sky blue → lily hot pink → reveal-lily coral
  background: 'linear-gradient(123deg, #0B0524 7%, #097DFE 37%, #DF0DA2 72%, #FA5A5A 100%)',
  boxShadow: '0px 4px 4px rgba(9, 125, 254, 0.25), 4px 4px 12px #9C12A0 inset',
  outline: '2px solid #FFFFFF',
  outlineOffset: '-3px',
};

/**
 * Primary CTA pill, magenta/violet gradient with an inset glow and a white
 * inner outline. With a mailto href it also copies the address to the
 * clipboard and confirms with a toast, so the click always gives feedback.
 */
export default function ContactButton({ label = 'Contact Me', className = '', href }: ContactButtonProps) {
  const toast = useToast();

  const handleClick = () => {
    if (href?.startsWith('mailto:')) {
      const value = href.replace('mailto:', '');
      copyToClipboard(value);
      toast(`email copied: ${value}`);
    }
  };

  if (href) {
    return (
      <a href={href} onClick={handleClick} data-magnetic className={`${BASE_CLASS} ${className}`} style={BUTTON_STYLE}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" onClick={handleClick} data-magnetic className={`${BASE_CLASS} ${className}`} style={BUTTON_STYLE}>
      {label}
    </button>
  );
}
