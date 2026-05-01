import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowDown, Github, Linkedin, Mail, Sparkles, Code2, Rocket } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [roleIndex, setRoleIndex] = useState(0);

  const roles = [
    t('hero.role.1'),
    t('hero.role.2'),
    t('hero.role.3'),
    t('hero.role.4'),
  ];

  // Cycle through roles
  useEffect(() => {
    const id = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 2400);
    return () => clearInterval(id);
  }, [roles.length]);

  // Mouse-tracking spotlight
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const scrollToProjects = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' });
  };
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Floating tech badges
  const techBadges = [
    { label: '.NET', x: '8%', y: '22%', delay: 0 },
    { label: 'Kotlin', x: '85%', y: '18%', delay: 0.4 },
    { label: 'Docker', x: '12%', y: '70%', delay: 0.8 },
    { label: 'PostgreSQL', x: '88%', y: '72%', delay: 1.2 },
    { label: 'Redis', x: '5%', y: '45%', delay: 1.6 },
    { label: 'AWS', x: '92%', y: '45%', delay: 2.0 },
  ];

  const stats = [
    { icon: Sparkles, value: '2+', labelKey: 'hero.stat.experience' },
    { icon: Code2, value: '10+', labelKey: 'hero.stat.projects' },
    { icon: Rocket, value: '∞', labelKey: 'hero.stat.stack' },
  ];

  return (
    <section
      ref={sectionRef}
      className="min-h-screen relative flex items-center justify-center overflow-hidden pt-28 pb-20 md:pt-24 md:pb-16"
    >
      {/* Layered Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      {/* Mouse-tracking spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, hsl(187 100% 42% / 0.12), transparent 60%)`,
        }}
      />

      {/* Animated floating blobs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating tech badges (decorative) */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {techBadges.map((b) => (
          <motion.div
            key={b.label}
            className="absolute"
            style={{ left: b.x, top: b.y }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.55, y: [0, -8, 0] }}
            transition={{
              opacity: { delay: 0.8 + b.delay, duration: 0.6 },
              y: { delay: 0.8 + b.delay, duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <span className="px-3 py-1 text-xs font-mono rounded-full glass-card text-muted-foreground border-primary/20">
              {b.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full glass-card border-primary/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-foreground/90 tracking-wide">
              {t('hero.status')}
            </span>
          </motion.div>

          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary font-medium mb-4 tracking-[0.3em] uppercase text-xs"
          >
            {t('hero.greeting')}
          </motion.p>

          {/* Name with animated gradient + shimmer */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 relative"
          >
            <span className="bg-clip-text text-transparent bg-[linear-gradient(110deg,hsl(210_40%_98%),45%,hsl(187_100%_70%),55%,hsl(210_40%_98%))] bg-[length:200%_100%] animate-shimmer drop-shadow-[0_0_25px_hsl(187_100%_42%/0.35)]">
              {t('hero.name')}
            </span>
          </motion.h1>

          {/* Cycling role with typewriter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-10 md:h-12 mb-6 flex items-center justify-center gap-3"
          >
            <span className="text-primary text-2xl md:text-3xl font-mono">{'<'}</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="text-2xl md:text-3xl font-display gradient-text glow-text"
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
            <span className="text-primary text-2xl md:text-3xl font-mono">{'/>'}</span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <motion.button
              onClick={scrollToProjects}
              className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg glow-box hover:glow-box-lg transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('hero.cta.projects')}
            </motion.button>
            <motion.button
              onClick={scrollToContact}
              className="px-8 py-4 border border-primary/50 text-foreground font-semibold rounded-lg hover:bg-primary/10 hover:border-primary transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('hero.cta.contact')}
            </motion.button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto mb-10"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.labelKey}
                whileHover={{ y: -4, scale: 1.03 }}
                className="glass-card rounded-xl p-3 md:p-4 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <s.icon className="text-primary" size={18} />
                  <span className="text-2xl md:text-3xl font-display font-bold gradient-text">
                    {s.value}
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-muted-foreground uppercase tracking-wider">
                  {t(s.labelKey)}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex justify-center gap-6"
          >
            {[
              { icon: Github, href: 'https://github.com/abohashem9639' },
              { icon: Linkedin, href: 'https://www.linkedin.com/in/salahelden-abo-hashem' },
              { icon: Mail, href: 'mailto:salahelden.abohashem@gmail.com' },
            ].map(({ icon: Icon, href }, index) => (
              <motion.a
                key={index}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-secondary/50 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300"
                whileHover={{ scale: 1.15, y: -3, rotate: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground"
        >
          <ArrowDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
