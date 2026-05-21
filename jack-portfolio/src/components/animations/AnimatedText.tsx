import { useRef, type CSSProperties } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface AnimatedCharProps {
  char: string;
  scrollYProgress: MotionValue<number>;
  start: number;
  end: number;
}

function AnimatedChar({ char, scrollYProgress, start, end }: AnimatedCharProps) {
  const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ opacity: 0, userSelect: 'none' }} aria-hidden>
        {char}
      </span>
      <motion.span
        style={{ position: 'absolute', left: 0, top: 0, opacity }}
        aria-hidden
      >
        {char}
      </motion.span>
    </span>
  );
}

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

export function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });

  const chars = text.split('');

  return (
    <p ref={ref} className={className} style={style} aria-label={text}>
      {chars.map((char, i) => {
        const start = i / chars.length;
        const end = start + 1 / chars.length;
        return (
          <AnimatedChar
            key={i}
            char={char === ' ' ? ' ' : char}
            scrollYProgress={scrollYProgress}
            start={start}
            end={end}
          />
        );
      })}
    </p>
  );
}
