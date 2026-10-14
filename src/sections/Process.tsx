import type { FC } from 'react';
import { steps } from './data';
import { Reveal, SectionHeading } from './Reveal';

export const Process: FC = () => (
  <section id="panel-process" aria-labelledby="process-heading" className="scroll-mt-24 py-20 md:py-28">
    <Reveal>
      <SectionHeading id="process-heading" kicker="03 — How it works" first="MY" second="PROCESS" />
    </Reveal>
    <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
      {steps.map((step, i) => (
        <li key={step.id}>
          <Reveal delay={i * 0.08}>
            <div className="border-t border-white/25 pt-6">
              <p className="mb-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-cyan-300/80">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-300" aria-hidden="true" />
                Step {step.id}
              </p>
              <h3 className="font-['Staatliches'] text-4xl leading-none tracking-wide">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-[#cccccc]">{step.text}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  </section>
);

export default Process;
