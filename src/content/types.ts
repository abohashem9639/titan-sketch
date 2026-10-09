import type { IconName } from './icons';

/** A piece of text in both site languages. */
export interface Localized {
  en: string;
  ar: string;
}

export interface TextItem {
  id: string;
  text: Localized;
}

export interface GeneralContent {
  logo: string;
  logoAlt: string;
  socials: { github: string; linkedin: string; email: string };
  nav: {
    about: Localized;
    skills: Localized;
    experience: Localized;
    projects: Localized;
    education: Localized;
    additional: Localized;
    contact: Localized;
  };
  footer: { name: Localized; rights: Localized };
}

export interface HeroContent {
  status: Localized;
  greeting: Localized;
  name: Localized;
  roles: TextItem[];
  subtitle: Localized;
  ctaProjects: Localized;
  ctaContact: Localized;
  stats: { id: string; icon: IconName; value: string; label: Localized }[];
  techBadges: { id: string; label: string; x: number; y: number }[];
}

export interface AboutContent {
  title: Localized;
  highlights: { id: string; icon: IconName; label: Localized; value: Localized }[];
  paragraphs: TextItem[];
}

export interface SkillsContent {
  title: Localized;
  categories: { id: string; title: Localized; skills: string[] }[];
}

export interface ExperienceItem {
  id: string;
  company: Localized;
  role: Localized;
  period: Localized;
  logo: string;
  points: TextItem[];
}

export interface ExperienceContent {
  title: Localized;
  items: ExperienceItem[];
}

export interface ProjectItem {
  id: string;
  title: Localized;
  role: Localized;
  description: Localized;
  tech: string[];
  glowFrom: string;
  glowTo: string;
  github: string;
  liveUrl: string;
}

export interface ProjectsContent {
  title: Localized;
  items: ProjectItem[];
}

export interface EducationContent {
  title: Localized;
  items: { id: string; degree: Localized; institution: Localized; location: Localized; period: Localized }[];
}

export interface AdditionalContent {
  title: Localized;
  languagesTitle: Localized;
  softSkillsTitle: Localized;
  languages: { id: string; name: Localized; level: Localized; percent: number }[];
  softSkills: TextItem[];
}

export interface ContactContent {
  title: Localized;
  subtitle: Localized;
  email: string;
  phone: string;
  location: Localized;
  emailLabel: Localized;
  phoneLabel: Localized;
  locationLabel: Localized;
  cta: Localized;
}

export interface SiteContent {
  general: GeneralContent;
  hero: HeroContent;
  about: AboutContent;
  skills: SkillsContent;
  experience: ExperienceContent;
  projects: ProjectsContent;
  education: EducationContent;
  additional: AdditionalContent;
  contact: ContactContent;
}

export type SectionKey = keyof SiteContent;

export const SECTION_KEYS: SectionKey[] = [
  'general',
  'hero',
  'about',
  'skills',
  'experience',
  'projects',
  'education',
  'additional',
  'contact',
];
