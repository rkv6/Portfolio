import { useEffect, useRef, type FC } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import Work from './Work';
import Services from './Services';
import Process from './Process';
import Testimonials from './Testimonials';
import ContactCta from './ContactCta';
import { testimonials } from './data';

interface WorkPanelProps {
  onClose: () => void;
  /** 'work' | 'services' | 'process' | 'testimonials' | 'contact': scrolls there when the panel opens. */
  initialSection?: string;
}

const nav = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'Process' },
  ...(testimonials.length > 0 ? [{ id: 'testimonials', label: 'Notes' }] : []),
  { id: 'contact', label: 'Contact' },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const WorkPanel: FC<WorkPanelProps> = ({ onClose, initialSection }) => {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const scrollTo = (id: string, smooth: boolean) => {
    panelRef.current
      ?.querySelector(`#panel-${id}`)
      ?.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
  };

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      // Keep keyboard focus inside the panel while it is open.
      if (e.key === 'Tab' && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);

    let timer: number | undefined;
    if (initialSection) {
      timer = window.setTimeout(() => scrollTo(initialSection, true), 450);
    }

    return () => {
      window.removeEventListener('keydown', onKey);
      if (timer) window.clearTimeout(timer);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Selected work, services, process and contact"
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black font-['Satoshi'] text-white"
      initial={{ opacity: 0, y: reduce ? 0 : 48 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduce ? 0 : 48 }}
      transition={{ duration: reduce ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] as const }}
      // The page behind listens for wheel/touch to drive the intro and the globe; keep scrolling local to the panel.
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-12">
          <span className="font-['Stint_Ultra_Condensed'] text-2xl uppercase leading-none tracking-wide">rk-studio</span>
          <nav aria-label="Panel sections" className="hidden items-center gap-6 text-sm md:flex">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id, true)}
                className="text-neutral-300 underline-offset-8 transition-colors hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="inline-flex items-center gap-2 rounded border border-white/60 px-4 py-2 text-sm transition-colors hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Close <X size={16} aria-hidden="true" />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 md:px-12">
        <Work />
        <Services />
        <Process />
        <Testimonials />
        <ContactCta />
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-white/10 px-6 py-8 text-xs uppercase tracking-[0.1em] text-neutral-500 md:px-12">
        <span>&copy; {new Date().getFullYear()} rk-studio</span>
        <span>Kerala, India</span>
      </footer>
    </motion.div>
  );
};

export default WorkPanel;
