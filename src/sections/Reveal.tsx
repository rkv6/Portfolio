import type { FC, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Fades and slides content in once when it scrolls into view. Respects reduced-motion. */
export const Reveal: FC<RevealProps> = ({ children, delay = 0, className }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease: [0.16, 1, 0.3, 1] as const }}
    >
      {children}
    </motion.div>
  );
};

interface HeadingProps {
  kicker: string;
  first: string;
  second: string;
  id: string;
}

/** Section heading in the same style as the site's "ABOUT ME": bold condensed word + thin italic word. */
export const SectionHeading: FC<HeadingProps> = ({ kicker, first, second, id }) => (
  <div className="mb-10 md:mb-14">
    <p className="font-['Satoshi'] text-xs uppercase tracking-[0.25em] text-cyan-300/80 mb-3">{kicker}</p>
    <h2 id={id} className="font-['Staatliches'] text-6xl md:text-8xl leading-none">
      <span>{first}</span>{' '}
      <span className="font-['Stint_Ultra_Condensed'] font-normal">{second}</span>
    </h2>
  </div>
);
