import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';

const Education = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="education" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            <span className="gradient-text">{t('education.title')}</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-1 bg-primary mx-auto rounded-full"
          />
        </div>

        {/* Education Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary to-transparent" />

            {/* Education Item */}
            <div className="relative flex gap-6">
              {/* Timeline Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center glow-box">
                  <GraduationCap className="text-primary" size={28} />
                </div>
              </div>

              {/* Content */}
              <div className="glass-card rounded-2xl p-6 flex-grow hover:border-primary/50 transition-all duration-300">
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {t('education.degree')}
                </h3>
                <p className="text-primary font-medium mb-4">
                  {t('education.university')}
                </p>
                
                <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span>{t('education.location')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    <span>{t('education.period')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Education;
