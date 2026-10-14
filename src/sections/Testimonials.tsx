import type { FC } from 'react';
import { testimonials } from './data';
import { Reveal, SectionHeading } from './Reveal';

/** Renders nothing until real testimonials are added to data.ts. */
export const Testimonials: FC = () => {
  if (testimonials.length === 0) return null;
  return (
    <section id="panel-testimonials" aria-labelledby="testimonials-heading" className="scroll-mt-24 py-20 md:py-28">
      <Reveal>
        <SectionHeading id="testimonials-heading" kicker="04 — Kind words" first="CLIENT" second="NOTES" />
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={`${t.name}-${i}`} delay={i * 0.1} className="h-full">
            <figure className="flex h-full flex-col justify-between rounded-md border border-white/15 p-8">
              <blockquote className="text-xl leading-relaxed text-white">“{t.quote}”</blockquote>
              <figcaption className="mt-6 text-sm text-neutral-400">
                <span className="font-semibold text-white">{t.name}</span> · {t.role}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
