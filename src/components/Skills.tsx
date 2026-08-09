import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SkillCategory {
  titleKey: string;
  skills: string[];
}

const skillCategories: SkillCategory[] = [
  {
    titleKey: 'skills.languages',
    skills: ['C# (.NET)', 'SQL', 'PHP', 'C++', 'C', 'Kotlin', 'JavaScript', 'HTML5', 'CSS3', 'XML'],
  },
  {
    titleKey: 'skills.backend',
    skills: ['ASP.NET Core', '.NET 6/8/10', 'Entity Framework Core', 'RESTful APIs', 'JWT Auth', 'Centralized Error Handling', 'RBAC', 'Multi-level Permissions', 'Redis', 'RabbitMQ', 'Queue Workers', 'Background Jobs', 'Elasticsearch', 'Meilisearch'],
  },
  {
    titleKey: 'skills.architecture',
    skills: ['Clean Architecture', 'DDD', 'Microservices', 'N-Tier', 'Repository Pattern', 'Unit of Work', 'MVI', 'Unit Testing', 'Feature Testing'],
  },
  {
    titleKey: 'skills.mobile',
    skills: ['Android SDK', 'Jetpack Compose', 'Android Studio', 'Responsive Design'],
  },
  {
    titleKey: 'skills.databases',
    skills: ['PostgreSQL', 'PostGIS', 'MySQL', 'Redis', 'Complex Schema Design'],
  },
  {
    titleKey: 'skills.tools',
    skills: ['AWS', 'MinIO', 'Docker', 'Git', 'GitHub Actions', 'Jira', 'Postman', 'Figma', 'Visual Studio', 'VS Code'],
  },
];

const Skills = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            <span className="gradient-text">{t('skills.title')}</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-1 bg-primary mx-auto rounded-full"
          />
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {skillCategories.map((category, catIndex) => (
            <motion.div
              key={category.titleKey}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + catIndex * 0.1 }}
              className="glass-card p-6 rounded-xl group hover:border-primary/50 transition-all duration-300"
            >
              <h3 className="text-lg font-display font-semibold text-foreground mb-4 pb-2 border-b border-border/50">
                {t(category.titleKey)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + catIndex * 0.1 + skillIndex * 0.03 }}
                    className="px-3 py-1.5 text-sm bg-secondary/50 text-muted-foreground rounded-lg border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
