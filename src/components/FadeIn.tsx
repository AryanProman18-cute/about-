import { motion } from 'framer-motion';
import { useMemo, type ComponentType, type CSSProperties, type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  /** Element type to render (div, h1, h2, nav, section, ...). */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}

/**
 * Scroll-triggered fade/slide wrapper.
 * Animates opacity + translate into view once, with a soft cubic-bezier ease.
 */
export default function FadeIn({
  children,
  as = 'div',
  className,
  style,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
}: FadeInProps) {
  // motion.create() builds a motion-enhanced component for any element type.
  const MotionComponent = useMemo(() => {
    const createMotionComponent = motion.create as unknown as (
      component: string
    ) => ComponentType<Record<string, unknown>>;
    return createMotionComponent(as);
  }, [as]);

  return (
    <MotionComponent
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </MotionComponent>
  );
}
