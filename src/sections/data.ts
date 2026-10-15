// Edit this file to change what the Work / Services / Process / Contact panel shows.
// Nothing here is rendered as real client work until you replace the sample entries.

export const EMAIL = 'rithink604@gmail.com';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/rithin-k-varghese/';
export const GITHUB_URL = 'https://github.com/rkv6';
/** Paste your Instagram profile link here. While empty, the Instagram link is hidden from the footer. */
export const INSTAGRAM_URL = '';

// Paste a Calendly / Cal.com / Google appointment link here to show a "Book a call" button.
// Leave it empty and the button is hidden.
export const BOOKING_URL = '';

export interface Project {
  id: string;
  title: string;
  kind: string;
  /** 'Concept' shows a badge so visitors know it is practice work, not a client project. */
  status: 'Concept' | 'Client' | 'Personal';
  year: string;
  summary: string;
  stack: string[];
  /** Live link. Leave empty to show "Case study coming soon". */
  href?: string;
  /** Optional screenshot, e.g. '/projects/harbour-table.jpg' (put the file in /public/projects). */
  image?: string;
  /** Text for the image's alt attribute. */
  imageAlt?: string;
}

// SAMPLE ENTRIES: replace with your real projects. Concept projects are fine
// while you build your portfolio, as long as they stay labelled "Concept".
export const projects: Project[] = [
  {
    id: '01',
    title: 'Ponni',
    kind: 'Bakery and tea house website',
    status: 'Concept',
    year: '2026',
    summary: 'A live oven board that follows the clock, a priced menu, and pickup pre-orders sent straight to WhatsApp.',
    stack: ['React', 'TypeScript', 'WhatsApp orders'],
    href: 'https://ponni-bakery.vercel.app/',
    image: '/projects/ponni.webp',
    imageAlt: 'The Ponni bakery website: the word Ponni in large dark blue letters on a turmeric yellow background.',
  },
  {
    id: '02',
    title: 'Loom & Leaf',
    kind: 'E-commerce store',
    status: 'Concept',
    year: '2026',
    summary: 'Product pages, cart and checkout flow, with a custom API handling stock and orders.',
    stack: ['React', 'Node API', 'Payments'],
  },
  {
    id: '03',
    title: 'Clinic Nova',
    kind: 'Clinic website',
    status: 'Concept',
    year: '2026',
    summary: 'Service pages, doctor profiles and an appointment request form that emails the front desk.',
    stack: ['React', 'Forms', 'SEO'],
  },
];

export interface Service {
  id: string;
  title: string;
  text: string;
  tags: string[];
}

export const services: Service[] = [
  {
    id: '01',
    title: 'Business websites',
    text: 'Fast, responsive sites that explain what you do and make it easy to get in touch.',
    tags: ['Design', 'Development', 'SEO basics'],
  },
  {
    id: '02',
    title: 'E-commerce',
    text: 'Stores built around conversion: clean product pages, simple checkout, reliable orders.',
    tags: ['Catalogue', 'Checkout', 'Payments'],
  },
  {
    id: '03',
    title: 'Custom APIs & integrations',
    text: 'Back-end logic for the parts off-the-shelf tools cannot handle, connected to the tools you already use.',
    tags: ['REST APIs', 'Automation', 'Integrations'],
  },
  {
    id: '04',
    title: 'Care & maintenance',
    text: 'Updates, backups, speed checks and small changes after launch, so the site stays healthy.',
    tags: ['Updates', 'Backups', 'Support'],
  },
];

export interface Step {
  id: string;
  title: string;
  text: string;
}

export const steps: Step[] = [
  { id: '01', title: 'Discover', text: 'A short call and questionnaire to understand your goals, customers and content.' },
  { id: '02', title: 'Design', text: 'Sitemap, wireframes and mockups you review before any code is written.' },
  { id: '03', title: 'Build', text: 'Development on a private staging link so you can follow progress.' },
  { id: '04', title: 'Launch', text: 'Testing on real devices, then go-live and a handover with a guide.' },
  { id: '05', title: 'Support', text: 'Bug fixes after launch, plus optional ongoing care plans.' },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

// The Testimonials section stays hidden while this list is empty.
// Add real quotes only, for example:
// { quote: 'Rithin delivered on time and the site loads fast.', name: 'Client name', role: 'Business, City' },
export const testimonials: Testimonial[] = [];
