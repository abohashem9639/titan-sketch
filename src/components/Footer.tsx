import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Github, Linkedin, Mail } from 'lucide-react';
import profileLogo from '@/assets/profile-logo.png';
const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.a
            href="#"
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={profileLogo} 
              alt="Salah Elden" 
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/50"
            />
          </motion.a>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © {currentYear} Salahuddin. {t('footer.rights')}
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
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
                className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
