import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

interface CharProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

/**
 * Single character: an invisible placeholder reserves layout space while an
 * absolutely-positioned span animates its opacity with scroll progress.
 */
function Char({ char, progress, range }: CharProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <span className="relative inline-block">
      <span className="invisible">{char}</span>
      <motion.span className="absolute inset-0" style={{ opacity }}>
        {char}
      </motion.span>
    </span>
  );
}

/**
 * Character-by-character scroll-reveal paragraph.
 * Each character fades from 0.2 to 1 opacity as the paragraph travels
 * through the viewport (offset: ['start 0.8', 'end 0.2']).
 */
export default function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const words = text.split(' ');
  const totalChars = text.length;

  let charCount = 0;

  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {words.map((word, wordIndex) => {
        const wordStart = charCount;
        charCount += word.length + 1; // +1 accounts for the following space

        return (
          <span key={wordIndex}>
            <span className="inline-block">
              {word.split('').map((char, charIndex) => {
                const globalIndex = wordStart + charIndex;
                const start = globalIndex / totalChars;
                const end = (globalIndex + 1) / totalChars;
                return (
                  <Char key={charIndex} char={char} progress={scrollYProgress} range={[start, end]} />
                );
              })}
            </span>
            {wordIndex < words.length - 1 ? ' ' : null}
          </span>
        );
      })}
    </p>
  );
}
