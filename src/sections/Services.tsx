import type { FC } from 'react';
import { services } from './data';
import { Reveal, SectionHeading } from './Reveal';

export const Services: FC = () => (
  <section id="panel-services" aria-labelledby="services-heading" className="scroll-mt-24 py-20 md:py-28">
    <Reveal>
      <SectionHeading id="services-heading" kicker="02 — What I do" first="WHAT I" second="BUILD" />
    </Reveal>
    <ul className="border-b border-white/15">
      {services.map((service, i) => (
        <li key={service.id}>
          <Reveal delay={i * 0.07}>
            <div className="group grid items-start gap-3 border-t border-white/15 px-2 py-8 transition-colors duration-500 hover:bg-white/[0.04] md:grid-cols-[6rem_1fr_1.3fr] md:gap-8 md:px-4">
              <span className="font-['Stint_Ultra_Condensed'] text-5xl leading-none text-neutral-500 transition-colors duration-500 group-hover:text-cyan-300">
                {service.id}
              </span>
              <h3 className="font-['Staatliches'] text-4xl leading-none tracking-wide transition-transform duration-500 group-hover:translate-x-2 md:text-5xl">
                {service.title}
              </h3>
              <div>
                <p className="leading-relaxed text-[#cccccc]">{service.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${service.title} includes`}>
                  {service.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-white/20 px-3 py-1 text-xs text-neutral-300">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  </section>
);

export default Services;
