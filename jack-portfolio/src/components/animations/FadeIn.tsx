'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, ElementType } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: ElementType;
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  as = 'div',
}: FadeInProps) {
  const prefersReduced = useReducedMotion();
  const MotionEl = motion.create(as as ElementType);

  return (
    <MotionEl
      className={className}
      initial={prefersReduced ? { opacity: 1 } : { opacity: 0, x, y }}
      whileInView={prefersReduced ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </MotionEl>
  );
}
