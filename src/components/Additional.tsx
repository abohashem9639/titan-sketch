import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContent } from '@/content/ContentContext';
import { Globe, Sparkles } from 'lucide-react';

const Additional = () => {
  const { l } = useLanguage();
  const { additional } = useContent();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="additional" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            <span className="gradient-text">{l(additional.title)}</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-1 bg-primary mx-auto rounded-full"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Languages Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground">
                {l(additional.languagesTitle)}
              </h3>
            </div>

            <div className="space-y-5">
              {additional.languages.map((lang, index) => (
                <div key={lang.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium">{l(lang.name)}</span>
                    <span className="text-primary text-sm">{l(lang.level)}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${lang.percent}%` } : {}}
                      transition={{ delay: 0.5 + index * 0.15, duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Soft Skills Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground">
                {l(additional.softSkillsTitle)}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {additional.softSkills.map((skill, index) => (
                <motion.span
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.08 }}
                  className="px-3 py-1.5 text-sm bg-secondary/50 text-muted-foreground rounded-lg border border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
                >
                  {l(skill.text)}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Additional;
