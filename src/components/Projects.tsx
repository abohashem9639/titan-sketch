import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContent } from '@/content/ContentContext';
import { ExternalLink, Github, Layers } from 'lucide-react';

// Hex color + alpha, e.g. ('#06b6d4', 0.2) -> '#06b6d433'.
const withAlpha = (hex: string, alpha: number) =>
  /^#[0-9a-f]{6}$/i.test(hex)
    ? hex + Math.round(alpha * 255).toString(16).padStart(2, '0')
    : hex;

const Projects = () => {
  const { l } = useLanguage();
  const { projects } = useContent();
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
            <span className="gradient-text">{l(projects.title)}</span>
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
          {projects.items.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="group relative"
            >
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${withAlpha(project.glowFrom, 0.2)}, ${withAlpha(project.glowTo, 0.2)})`,
                }}
              />
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
                  {l(project.title)}
                </h3>
                <p className="text-primary text-sm mb-3 font-medium">
                  {l(project.role)}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-4">
                  {l(project.description)}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.tech.map((tech, techIndex) => (
                    <span
                      key={`${techIndex}-${tech}`}
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
