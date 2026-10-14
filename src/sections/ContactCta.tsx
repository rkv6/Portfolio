import type { FC } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BOOKING_URL, EMAIL, GITHUB_URL, LINKEDIN_URL } from './data';
import { Reveal } from './Reveal';

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded px-8 py-4 text-lg font-semibold font-['Satoshi'] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300";

export const ContactCta: FC = () => (
  <section id="panel-contact" aria-labelledby="contact-heading" className="scroll-mt-24 py-20 md:py-28">
    <Reveal>
      <div className="rounded-md border border-white/20 bg-gradient-to-br from-white/[0.06] to-transparent px-6 py-14 text-center md:px-16 md:py-24">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-cyan-300/80">Have a project in mind?</p>
        <h2 id="contact-heading" className="font-['Staatliches'] text-6xl leading-none md:text-9xl">
          LET'S WORK{' '}
          <span className="font-['Stint_Ultra_Condensed'] font-normal">TOGETHER</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#cccccc]">
          Tell me about your business and what you need. I reply within 24 hours with next steps and a clear quote.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent('Website project enquiry')}`}
            className={`${buttonBase} bg-white text-black hover:bg-cyan-300`}
          >
            Email me <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          {BOOKING_URL && (
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${buttonBase} border border-white text-white hover:bg-white hover:text-black`}
            >
              Book a call <ArrowUpRight size={20} aria-hidden="true" />
            </a>
          )}
        </div>
        <p className="mt-8 text-sm text-neutral-400">
          Or find me on{' '}
          <a className="underline underline-offset-4 hover:text-white" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>{' '}
          and{' '}
          <a className="underline underline-offset-4 hover:text-white" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>
    </Reveal>
  </section>
);

export default ContactCta;
