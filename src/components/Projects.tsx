import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExternalLink, Github, Layers } from 'lucide-react';

interface Project {
  titleKey: string;
  roleKey: string;
  descKey: string;
  tech: string[];
  color: string;
  github?: string;
  liveUrl?: string;
}

const projects: Project[] = [
  {
    titleKey: 'projects.talabati.title',
    roleKey: 'projects.talabati.role',
    descKey: 'projects.talabati.desc',
    tech: ['ASP.NET Core', 'Clean Architecture', 'PostgreSQL', 'Kotlin', 'Jetpack Compose', 'MVI'],
    color: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    titleKey: 'projects.talabatiCompany.title',
    roleKey: 'projects.talabatiCompany.role',
    descKey: 'projects.talabatiCompany.desc',
    tech: ['ASP.NET Core', 'Branch Management', 'Inventory', 'Order Processing'],
    color: 'from-emerald-500/20 to-cyan-500/20',
  },
  {
    titleKey: 'projects.quick.title',
    roleKey: 'projects.quick.role',
    descKey: 'projects.quick.desc',
    tech: ['PHP', 'JavaScript', 'Bootstrap', 'Admin Panel'],
    color: 'from-orange-500/20 to-amber-500/20',
  },
  {
    titleKey: 'projects.m79.title',
    roleKey: 'projects.m79.role',
    descKey: 'projects.m79.desc',
    tech: ['PHP', 'Real-time', 'High Concurrency', 'Low Latency'],
    color: 'from-purple-500/20 to-pink-500/20',
  },
  {
    titleKey: 'projects.crm.title',
    roleKey: 'projects.crm.role',
    descKey: 'projects.crm.desc',
    tech: ['ASP.NET Core', 'Workflows', 'Student Management'],
    color: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    titleKey: 'projects.diff.title',
    roleKey: 'projects.diff.role',
    descKey: 'projects.diff.desc',
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'React Query'],
    color: 'from-violet-500/20 to-fuchsia-500/20',
  },
  {
    titleKey: 'projects.ghiras.title',
    roleKey: 'projects.ghiras.role',
    descKey: 'projects.ghiras.desc',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'SQLite', 'BcryptJS'],
    color: 'from-amber-500/20 to-red-500/20',
  },
  {
    titleKey: 'projects.omega.title',
    roleKey: 'projects.omega.role',
    descKey: 'projects.omega.desc',
    tech: ['PHP', 'JavaScript', 'Bootstrap', 'HTML/CSS', 'Auto-Grading', 'TR-YÖS Style Exams'],
    color: 'from-rose-500/20 to-fuchsia-500/20',
  },
  {
    titleKey: 'projects.mkcl.title',
    roleKey: 'projects.mkcl.role',
    descKey: 'projects.mkcl.desc',
    tech: ['ASP.NET Core', '.NET 8', 'Web API', 'Employee Management', 'Client Management', 'Reports'],
    color: 'from-teal-500/20 to-emerald-500/20',
  },
  {
    titleKey: 'projects.notepad.title',
    roleKey: 'projects.notepad.role',
    descKey: 'projects.notepad.desc',
    tech: ['ASP.NET Core', 'Clean Architecture', 'PostgreSQL', 'React', 'TypeScript', 'SignalR', 'Tailwind CSS', 'JWT Auth'],
    color: 'from-sky-500/20 to-indigo-500/20',
  },
  {
    titleKey: 'projects.findmydevice.title',
    roleKey: 'projects.findmydevice.role',
    descKey: 'projects.findmydevice.desc',
    tech: ['.NET 10', 'Clean Architecture', 'Kotlin', 'Jetpack Compose', 'Next.js 16', 'Leaflet'],
    color: 'from-lime-500/20 to-emerald-500/20',
    github: 'https://github.com/abohashem9639/findmydevice-',
    liveUrl: 'https://abohashem9639-findmydevice.vercel.app',
  },
];

const Projects = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="projects" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            <span className="gradient-text">{t('projects.title')}</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-1 bg-primary mx-auto rounded-full"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.titleKey}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative glass-card rounded-2xl p-6 h-full flex flex-col hover:border-primary/50 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Layers size={24} />
                  </div>
                  {(project.github || project.liveUrl) && (
                    <div className="flex gap-2">
                      {project.github && (
                        <motion.a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View source on GitHub"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                        >
                          <Github size={18} />
                        </motion.a>
                      )}
                      {project.liveUrl && (
                        <motion.a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open live demo"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-lg bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                        >
                          <ExternalLink size={18} />
                        </motion.a>
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-display font-semibold text-foreground mb-1">
                  {t(project.titleKey)}
                </h3>
                <p className="text-primary text-sm mb-3 font-medium">
                  {t(project.roleKey)}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-4">
                  {t(project.descKey)}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs bg-secondary/50 text-muted-foreground rounded border border-border/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
