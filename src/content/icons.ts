import {
  Award,
  Briefcase,
  Code2,
  Cpu,
  Database,
  Globe,
  GraduationCap,
  Heart,
  Layers,
  Rocket,
  Server,
  Smartphone,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/** Icons the admin can pick for stats and highlights. */
export const ICONS = {
  sparkles: Sparkles,
  code: Code2,
  rocket: Rocket,
  server: Server,
  smartphone: Smartphone,
  briefcase: Briefcase,
  award: Award,
  trophy: Trophy,
  star: Star,
  zap: Zap,
  heart: Heart,
  globe: Globe,
  database: Database,
  cpu: Cpu,
  layers: Layers,
  users: Users,
  graduation: GraduationCap,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

export const getIcon = (name: string | undefined): LucideIcon =>
  (name && ICONS[name as IconName]) || Sparkles;
