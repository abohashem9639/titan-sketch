import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.skills': 'Skills',
    'nav.projects': 'Projects',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.greeting': 'Hello, I\'m',
    'hero.name': 'Salah Elden',
    'hero.title': 'Software Engineer',
    'hero.subtitle': 'Building Scalable Systems. Solving Complex Problems.',
    'hero.cta.projects': 'View Projects',
    'hero.cta.contact': 'Get in Touch',
    
    // About
    'about.title': 'About Me',
    'about.p1': 'Software Developer with over 2 years of experience in building robust web and mobile applications. Specialized in backend development using ASP.NET Core and native Android development using Kotlin and Jetpack Compose.',
    'about.p2': 'Eager to deepen technical expertise by joining highly experienced teams and contributing effectively to large-scale, challenging projects.',
    'about.p3': 'I focus on writing clean, maintainable code following best practices like Clean Architecture, DDD, and comprehensive testing strategies.',
    
    // Skills
    'skills.title': 'Technical Skills',
    'skills.languages': 'Programming Languages',
    'skills.backend': 'Backend Development',
    'skills.architecture': 'Architecture & Patterns',
    'skills.mobile': 'Mobile & Frontend',
    'skills.databases': 'Databases',
    'skills.tools': 'Tools & Platforms',
    
    // Projects
    'projects.title': 'Projects',
    'projects.viewCode': 'View Code',
    'projects.viewLive': 'Live Demo',
    
    'projects.talabati.title': 'Talabati',
    'projects.talabati.role': 'Full-Stack Developer',
    'projects.talabati.desc': 'An integrated ordering platform (restaurants, markets, pharmacies) with robust API using Clean Architecture and native Android app with Jetpack Compose.',
    
    'projects.talabatiCompany.title': 'TalabatiCompany',
    'projects.talabatiCompany.role': 'Project Lead',
    'projects.talabatiCompany.desc': 'Control panel for business management with Branch Management, Inventory/Stock Tracking, and Order Processing modules.',
    
    'projects.quick.title': 'Quick',
    'projects.quick.role': 'Full-Stack Developer',
    'projects.quick.desc': 'Restaurant management and order-processing system with user-friendly interface and dedicated admin panels for each restaurant.',
    
    'projects.m79.title': 'M79',
    'projects.m79.role': 'Full-Stack Developer',
    'projects.m79.desc': 'Real-time car auction platform engineered to handle high concurrency with low latency for fair bidding experience.',
    
    'projects.crm.title': 'University CRM',
    'projects.crm.role': 'Backend Developer',
    'projects.crm.desc': 'Custom CRM system for managing student files during private university admissions with advanced workflows.',
    
    // Education
    'education.title': 'Education',
    'education.degree': 'B.Sc. in Computer Engineering',
    'education.university': 'Sakarya University',
    'education.location': 'Sakarya, Turkey',
    'education.period': '2023 - Present',
    
    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': 'Let\'s build something amazing together',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.location': 'Location',
    'contact.cta': 'Send Message',
    
    // Footer
    'footer.rights': 'All rights reserved.',
  },
  ar: {
    // Navigation
    'nav.about': 'عني',
    'nav.skills': 'المهارات',
    'nav.projects': 'المشاريع',
    'nav.education': 'التعليم',
    'nav.contact': 'تواصل',
    
    // Hero
    'hero.greeting': 'مرحباً، أنا',
    'hero.name': 'صلاح الدين',
    'hero.title': 'مهندس برمجيات',
    'hero.subtitle': 'بناء أنظمة قابلة للتوسع. حل المشاكل المعقدة.',
    'hero.cta.projects': 'عرض المشاريع',
    'hero.cta.contact': 'تواصل معي',
    
    // About
    'about.title': 'عني',
    'about.p1': 'مطور برمجيات بخبرة تزيد عن عامين في بناء تطبيقات ويب وموبايل قوية. متخصص في تطوير الباك إند باستخدام ASP.NET Core وتطوير أندرويد الأصلي باستخدام Kotlin و Jetpack Compose.',
    'about.p2': 'حريص على تعميق الخبرة التقنية من خلال الانضمام إلى فرق ذات خبرة عالية والمساهمة بفعالية في مشاريع كبيرة ومعقدة.',
    'about.p3': 'أركز على كتابة كود نظيف وقابل للصيانة باتباع أفضل الممارسات مثل Clean Architecture و DDD واستراتيجيات الاختبار الشاملة.',
    
    // Skills
    'skills.title': 'المهارات التقنية',
    'skills.languages': 'لغات البرمجة',
    'skills.backend': 'تطوير الباك إند',
    'skills.architecture': 'الهندسة والأنماط',
    'skills.mobile': 'الموبايل والفرونت إند',
    'skills.databases': 'قواعد البيانات',
    'skills.tools': 'الأدوات والمنصات',
    
    // Projects
    'projects.title': 'المشاريع',
    'projects.viewCode': 'عرض الكود',
    'projects.viewLive': 'عرض مباشر',
    
    'projects.talabati.title': 'طلباتي',
    'projects.talabati.role': 'مطور Full-Stack',
    'projects.talabati.desc': 'منصة طلبات متكاملة (مطاعم، أسواق، صيدليات) مع API قوي باستخدام Clean Architecture وتطبيق أندرويد أصلي مع Jetpack Compose.',
    
    'projects.talabatiCompany.title': 'طلباتي للشركات',
    'projects.talabatiCompany.role': 'قائد المشروع',
    'projects.talabatiCompany.desc': 'لوحة تحكم لإدارة الأعمال مع وحدات إدارة الفروع وتتبع المخزون ومعالجة الطلبات.',
    
    'projects.quick.title': 'Quick',
    'projects.quick.role': 'مطور Full-Stack',
    'projects.quick.desc': 'نظام إدارة المطاعم ومعالجة الطلبات مع واجهة سهلة الاستخدام ولوحات إدارة مخصصة لكل مطعم.',
    
    'projects.m79.title': 'M79',
    'projects.m79.role': 'مطور Full-Stack',
    'projects.m79.desc': 'منصة مزادات سيارات في الوقت الفعلي مصممة للتعامل مع التزامن العالي وزمن استجابة منخفض.',
    
    'projects.crm.title': 'نظام CRM الجامعي',
    'projects.crm.role': 'مطور Backend',
    'projects.crm.desc': 'نظام CRM مخصص لإدارة ملفات الطلاب أثناء القبول الجامعي مع سير عمل متقدم.',
    
    // Education
    'education.title': 'التعليم',
    'education.degree': 'بكالوريوس في هندسة الحاسوب',
    'education.university': 'جامعة صقاريا',
    'education.location': 'صقاريا، تركيا',
    'education.period': '2023 - حالياً',
    
    // Contact
    'contact.title': 'تواصل معي',
    'contact.subtitle': 'دعنا نبني شيئاً رائعاً معاً',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'الهاتف',
    'contact.location': 'الموقع',
    'contact.cta': 'إرسال رسالة',
    
    // Footer
    'footer.rights': 'جميع الحقوق محفوظة.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
