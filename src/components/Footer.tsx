import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useContent } from '@/content/ContentContext';
import { Github, Linkedin, Mail } from 'lucide-react';
const Footer = () => {
  const { l } = useLanguage();
  const { general } = useContent();
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
              src={general.logo}
              alt={general.logoAlt}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/50"
            />
          </motion.a>

          {/* Copyright */}
          <p className="text-muted-foreground text-sm">
            © {currentYear} {l(general.footer.name)}. {l(general.footer.rights)}
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            {[
              { icon: Github, href: general.socials.github },
              { icon: Linkedin, href: general.socials.linkedin },
              { icon: Mail, href: general.socials.email && `mailto:${general.socials.email}` },
            ].filter(({ href }) => href).map(({ icon: Icon, href }, index) => (
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
