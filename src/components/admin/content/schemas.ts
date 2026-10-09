import type { SectionKey } from '@/content/types';
import { emptyText, type Field } from './fields';

export interface SectionSchema {
  title: string;
  description: string;
  fields: Field[];
}

const title = (label = 'Section title'): Field => ({ type: 'localized', key: 'title', label });

const textItem = (itemName: string, multiline = false): Extract<Field, { type: 'list' }> => ({
  type: 'list',
  key: '',
  label: '',
  itemName,
  fields: [{ type: 'localized', key: 'text', label: 'Text', multiline }],
  create: () => ({ text: emptyText() }),
});

export const SCHEMAS: Record<SectionKey, SectionSchema> = {
  general: {
    title: 'General',
    description: 'Profile photo, social links, navigation labels, and footer.',
    fields: [
      { type: 'image', key: 'logo', label: 'Profile photo', help: 'Shown in the navbar and the footer.' },
      { type: 'text', key: 'logoAlt', label: 'Photo description (alt text)', help: 'Read by screen readers.' },
      {
        type: 'group',
        key: 'socials',
        label: 'Social links',
        help: 'Used in the hero and the footer. Leave a field empty to hide its icon.',
        fields: [
          { type: 'text', key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/…' },
          { type: 'text', key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/…' },
          { type: 'text', key: 'email', label: 'Email', placeholder: 'you@example.com' },
        ],
      },
      {
        type: 'group',
        key: 'nav',
        label: 'Navigation labels',
        fields: [
          { type: 'localized', key: 'about', label: 'About' },
          { type: 'localized', key: 'skills', label: 'Skills' },
          { type: 'localized', key: 'experience', label: 'Experience' },
          { type: 'localized', key: 'projects', label: 'Projects' },
          { type: 'localized', key: 'education', label: 'Education' },
          { type: 'localized', key: 'additional', label: 'Languages & soft skills' },
          { type: 'localized', key: 'contact', label: 'Contact' },
        ],
      },
      {
        type: 'group',
        key: 'footer',
        label: 'Footer',
        help: 'Rendered as: © {year} {name}. {rights}',
        fields: [
          { type: 'localized', key: 'name', label: 'Name' },
          { type: 'localized', key: 'rights', label: 'Rights text' },
        ],
      },
    ],
  },

  hero: {
    title: 'Hero',
    description: 'The first screen visitors see.',
    fields: [
      { type: 'localized', key: 'status', label: 'Availability badge' },
      { type: 'localized', key: 'greeting', label: 'Greeting' },
      { type: 'localized', key: 'name', label: 'Name' },
      {
        ...textItem('title'),
        key: 'roles',
        label: 'Rotating titles',
        help: 'Shown one after another under your name.',
        summary: (item) => item.text as never,
      },
      { type: 'localized', key: 'subtitle', label: 'Tagline', multiline: true },
      { type: 'localized', key: 'ctaProjects', label: 'Primary button ("View projects")' },
      { type: 'localized', key: 'ctaContact', label: 'Secondary button ("Get in touch")' },
      {
        type: 'list',
        key: 'stats',
        label: 'Stats cards',
        itemName: 'stat',
        fields: [
          { type: 'icon', key: 'icon', label: 'Icon' },
          { type: 'text', key: 'value', label: 'Value', placeholder: '2+' },
          { type: 'localized', key: 'label', label: 'Label' },
        ],
        create: () => ({ icon: 'sparkles', value: '', label: emptyText() }),
      },
      {
        type: 'list',
        key: 'techBadges',
        label: 'Floating tech badges',
        help: 'Desktop only. Position is a percentage of the hero width/height.',
        itemName: 'badge',
        fields: [
          { type: 'text', key: 'label', label: 'Label', placeholder: '.NET' },
          { type: 'number', key: 'x', label: 'Horizontal position', min: 0, max: 100, suffix: '%' },
          { type: 'number', key: 'y', label: 'Vertical position', min: 0, max: 100, suffix: '%' },
        ],
        create: () => ({ label: '', x: 50, y: 50 }),
      },
    ],
  },

  about: {
    title: 'About',
    description: 'Highlight cards and the about paragraphs.',
    fields: [
      title(),
      {
        type: 'list',
        key: 'highlights',
        label: 'Highlight cards',
        itemName: 'card',
        fields: [
          { type: 'icon', key: 'icon', label: 'Icon' },
          { type: 'localized', key: 'label', label: 'Label' },
          { type: 'localized', key: 'value', label: 'Value' },
        ],
        create: () => ({ icon: 'code', label: emptyText(), value: emptyText() }),
      },
      { ...textItem('paragraph', true), key: 'paragraphs', label: 'Paragraphs' },
    ],
  },

  skills: {
    title: 'Skills',
    description: 'Skill categories and their tags.',
    fields: [
      title(),
      {
        type: 'list',
        key: 'categories',
        label: 'Categories',
        itemName: 'category',
        collapsible: true,
        summary: (item) => item.title as never,
        fields: [
          { type: 'localized', key: 'title', label: 'Category name' },
          { type: 'tags', key: 'skills', label: 'Skills' },
        ],
        create: () => ({ title: emptyText(), skills: [] }),
      },
    ],
  },

  experience: {
    title: 'Experience',
    description: 'Work history timeline. The first item is shown at the top.',
    fields: [
      title(),
      {
        type: 'list',
        key: 'items',
        label: 'Positions',
        itemName: 'position',
        collapsible: true,
        summary: (item) => item.company as never,
        fields: [
          { type: 'localized', key: 'company', label: 'Company' },
          { type: 'localized', key: 'role', label: 'Role' },
          { type: 'localized', key: 'period', label: 'Period', help: 'e.g. July 2026 – August 2026' },
          { type: 'image', key: 'logo', label: 'Company logo', help: 'Leave empty to show a briefcase icon.' },
          { ...textItem('bullet point', true), key: 'points', label: 'Bullet points' },
        ],
        create: () => ({ company: emptyText(), role: emptyText(), period: emptyText(), logo: '', points: [] }),
      },
    ],
  },

  projects: {
    title: 'Projects',
    description: 'Project cards, in the order they appear on the site.',
    fields: [
      title(),
      {
        type: 'list',
        key: 'items',
        label: 'Projects',
        itemName: 'project',
        collapsible: true,
        summary: (item) => item.title as never,
        fields: [
          { type: 'localized', key: 'title', label: 'Title' },
          { type: 'localized', key: 'role', label: 'Your role' },
          { type: 'localized', key: 'description', label: 'Description', multiline: true },
          { type: 'tags', key: 'tech', label: 'Tech tags' },
          { type: 'color', key: 'glowFrom', label: 'Hover glow: start color' },
          { type: 'color', key: 'glowTo', label: 'Hover glow: end color' },
          { type: 'text', key: 'github', label: 'GitHub URL', help: 'Leave empty to hide the icon.' },
          { type: 'text', key: 'liveUrl', label: 'Live demo URL', help: 'Leave empty to hide the icon.' },
        ],
        create: () => ({
          title: emptyText(),
          role: emptyText(),
          description: emptyText(),
          tech: [],
          glowFrom: '#06b6d4',
          glowTo: '#3b82f6',
          github: '',
          liveUrl: '',
        }),
      },
    ],
  },

  education: {
    title: 'Education',
    description: 'Degrees and schools.',
    fields: [
      title(),
      {
        type: 'list',
        key: 'items',
        label: 'Entries',
        itemName: 'entry',
        collapsible: true,
        summary: (item) => item.degree as never,
        fields: [
          { type: 'localized', key: 'degree', label: 'Degree' },
          { type: 'localized', key: 'institution', label: 'School / university' },
          { type: 'localized', key: 'location', label: 'Location' },
          { type: 'localized', key: 'period', label: 'Period' },
        ],
        create: () => ({ degree: emptyText(), institution: emptyText(), location: emptyText(), period: emptyText() }),
      },
    ],
  },

  additional: {
    title: 'Languages & Soft Skills',
    description: 'Spoken languages with level bars, and soft skills.',
    fields: [
      title(),
      { type: 'localized', key: 'languagesTitle', label: 'Languages card title' },
      {
        type: 'list',
        key: 'languages',
        label: 'Languages',
        itemName: 'language',
        fields: [
          { type: 'localized', key: 'name', label: 'Language' },
          { type: 'localized', key: 'level', label: 'Level' },
          { type: 'number', key: 'percent', label: 'Bar fill', min: 0, max: 100, suffix: '%' },
        ],
        create: () => ({ name: emptyText(), level: emptyText(), percent: 50 }),
      },
      { type: 'localized', key: 'softSkillsTitle', label: 'Soft skills card title' },
      { ...textItem('soft skill'), key: 'softSkills', label: 'Soft skills' },
    ],
  },

  contact: {
    title: 'Contact',
    description: 'Contact details and the call-to-action button.',
    fields: [
      title(),
      { type: 'localized', key: 'subtitle', label: 'Subtitle' },
      { type: 'text', key: 'email', label: 'Email', help: 'Also used by the "Send message" button.' },
      { type: 'text', key: 'phone', label: 'Phone', help: 'Shown as typed; the call link uses the digits only.' },
      { type: 'localized', key: 'location', label: 'Location' },
      { type: 'localized', key: 'emailLabel', label: 'Email card label' },
      { type: 'localized', key: 'phoneLabel', label: 'Phone card label' },
      { type: 'localized', key: 'locationLabel', label: 'Location card label' },
      { type: 'localized', key: 'cta', label: 'Button text' },
    ],
  },
};
