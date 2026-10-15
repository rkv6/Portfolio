import type { FC } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { projects, type Project } from './data';
import { Reveal, SectionHeading } from './Reveal';

const glows = ['#00ffff', '#8a7dff', '#ff9d5c'];

const ProjectCard: FC<{ project: Project; index: number }> = ({ project, index }) => {
  const glow = glows[index % glows.length];
  return (
    <article className="group h-full flex flex-col border border-white/15 rounded-md overflow-hidden bg-white/[0.02] transition-colors duration-500 hover:border-white/70 focus-within:border-white/70">
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: `radial-gradient(120% 90% at 20% 10%, ${glow}33, transparent 60%), #0a0a0a` }}
      >
        {project.image && (
          <img
            src={project.image}
            alt={project.imageAlt ?? `${project.title} website screenshot`}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <span
          aria-hidden="true"
          className={`absolute right-5 bottom-2 font-['Stint_Ultra_Condensed'] text-[7rem] leading-none select-none transition-transform duration-700 group-hover:-translate-y-2 ${
            project.image ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]' : 'text-white/15'
          }`}
        >
          {project.id}
        </span>
        <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-black/60 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] backdrop-blur">
          {project.status}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          {project.kind} · {project.year}
        </p>
        <h3 className="font-['Staatliches'] text-4xl leading-none tracking-wide">{project.title}</h3>
        <p className="text-[#cccccc] leading-relaxed">{project.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-2 pt-2" aria-label="Technologies used">
          {project.stack.map((tech) => (
            <li key={tech} className="rounded border border-white/20 px-2 py-1 text-xs text-neutral-300">
              {tech}
            </li>
          ))}
        </ul>
        <div className="pt-3 border-t border-white/10 text-sm">
          {project.href ? (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-white underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
            >
              View live site <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : (
            <span className="text-neutral-500">Case study coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
};

export const Work: FC = () => (
  <section id="panel-work" aria-labelledby="work-heading" className="scroll-mt-24 py-20 md:py-28">
    <Reveal>
      <SectionHeading id="work-heading" kicker="01 — Selected work" first="SELECTED" second="WORK" />
    </Reveal>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <Reveal key={project.id} delay={i * 0.1} className="h-full">
          <ProjectCard project={project} index={i} />
        </Reveal>
      ))}
    </div>
  </section>
);

export default Work;
