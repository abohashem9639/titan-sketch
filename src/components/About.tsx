import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Code2, Server, Smartphone } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const highlights = [
    { icon: Server, label: 'Backend', value: 'ASP.NET Core' },
    { icon: Smartphone, label: 'Mobile', value: 'Kotlin / Compose' },
    { icon: Code2, label: 'Experience', value: '2+ Years' },
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Section Title */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-display font-bold mb-4"
            >
              <span className="gradient-text">{t('about.title')}</span>
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: 80 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="h-1 bg-primary mx-auto rounded-full"
            />
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {highlights.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="glass-card p-6 rounded-xl text-center group hover:border-primary/50 transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon size={24} />
                </div>
                <p className="text-muted-foreground text-sm mb-1">{item.label}</p>
                <p className="text-foreground font-semibold">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* About Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 rounded-2xl space-y-6"
          >
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('about.p1')}
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('about.p2')}
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {t('about.p3')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
