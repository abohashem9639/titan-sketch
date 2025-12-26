import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const contactInfo = [
    { 
      icon: Mail, 
      labelKey: 'contact.email', 
      value: 'salahelden.abohashem@gmail.com',
      href: 'mailto:salahelden.abohashem@gmail.com'
    },
    { 
      icon: Phone, 
      labelKey: 'contact.phone', 
      value: '+90 531 606 0888',
      href: 'tel:+905316060888'
    },
    { 
      icon: MapPin, 
      labelKey: 'contact.location', 
      value: 'Sakarya, Turkey',
      href: null
    },
  ];

  return (
    <section id="contact" className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            <span className="gradient-text">{t('contact.title')}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg"
          >
            {t('contact.subtitle')}
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-1 bg-primary mx-auto rounded-full mt-4"
          />
        </div>

        {/* Contact Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.labelKey}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    className="glass-card p-6 rounded-xl flex flex-col items-center text-center group hover:border-primary/50 transition-all duration-300 block"
                  >
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                      <item.icon size={24} />
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{t(item.labelKey)}</p>
                    <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                      {item.value}
                    </p>
                  </a>
                ) : (
                  <div className="glass-card p-6 rounded-xl flex flex-col items-center text-center group hover:border-primary/50 transition-all duration-300">
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                      <item.icon size={24} />
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">{t(item.labelKey)}</p>
                    <p className="text-foreground font-medium">{item.value}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <motion.a
              href="mailto:salahelden.abohashem@gmail.com"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg glow-box hover:glow-box-lg transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send size={20} />
              {t('contact.cta')}
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
