import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Briefcase, Calendar } from 'lucide-react';
import alifbeeLogo from '@/assets/alifbee-logo.png';
import omegaLogo from '@/assets/omega-logo.png';

const Experience = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const experiences = [
    {
      company: t('experience.alifbee.company'),
      role: t('experience.alifbee.role'),
      period: t('experience.alifbee.period'),
      logo: alifbeeLogo,
      points: [
        t('experience.alifbee.point1'),
        t('experience.alifbee.point2'),
        t('experience.alifbee.point3'),
        t('experience.alifbee.point4'),
      ],
    },
    {
      company: t('experience.talabati.company'),
      role: t('experience.talabati.role'),
      period: t('experience.talabati.period'),
      points: [
        t('experience.talabati.point1'),
        t('experience.talabati.point2'),
        t('experience.talabati.point3'),
      ],
    },
    {
      company: t('experience.omega.company'),
      role: t('experience.omega.role'),
      period: t('experience.omega.period'),
      logo: omegaLogo,
      points: [
        t('experience.omega.point1'),
        t('experience.omega.point2'),
      ],
    },
  ];

  return (
    <section id="experience" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            <span className="gradient-text">{t('experience.title')}</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-1 bg-primary mx-auto rounded-full"
          />
        </div>

        {/* Experience Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.2 }}
                className="relative flex gap-6 mb-10 last:mb-0"
              >
                {/* Timeline Dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center glow-box overflow-hidden">
                    {exp.logo ? (
                      <img
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Briefcase className="text-primary" size={26} />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="glass-card rounded-2xl p-6 flex-grow hover:border-primary/50 transition-all duration-300">
                  <h3 className="text-xl font-display font-semibold text-foreground mb-1">
                    {exp.company}
                  </h3>
                  <p className="text-primary font-medium mb-3">
                    {exp.role}
                  </p>

                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Calendar size={16} className="text-primary" />
                    <span>{exp.period}</span>
                  </div>

                  <ul className="space-y-2">
                    {exp.points.map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-muted-foreground text-sm leading-relaxed"
                      >
                        <span className="text-primary mt-1.5 flex-shrink-0">
                          <span className="block w-1.5 h-1.5 rounded-full bg-primary" />
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
