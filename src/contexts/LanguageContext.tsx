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
    'nav.experience': 'Experience',
    'nav.education': 'Education',
    'nav.additional': 'More',
    'nav.contact': 'Contact',

    // Hero
    'hero.greeting': 'Hello, I\'m',
    'hero.name': 'Salahuddin',
    'hero.title': 'Computer Engineer',
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

    'projects.diff.title': 'Diff',
    'projects.diff.role': 'Full-Stack Developer',
    'projects.diff.desc': 'Modern e-commerce platform for trendy clothing. Built with React, Vite, Tailwind CSS, and Shadcn UI. Features Supabase backend, React Query for data fetching, and i18next for multi-language support.',

    'projects.ghiras.title': 'Ghiras 26 — Nadi Nawa',
    'projects.ghiras.role': 'Full-Stack Developer',
    'projects.ghiras.desc': 'Ramadan Iftar Management System built with Next.js App Router. Features a responsive UI with Tailwind CSS and full-stack capabilities using PostgreSQL, SQLite, and BcryptJS for secure authentication.',

    'projects.omega.title': 'Omega Education',
    'projects.omega.role': 'Full-Stack Developer',
    'projects.omega.desc': 'Comprehensive e-learning platform featuring recorded courses, job listings, downloadable worksheets, and a professional online examination system that mirrors the TR-YÖS test experience, backed by an advanced automated grading and evaluation engine.',

    // Experience
    'experience.title': 'Experience',
    'experience.talabati.company': 'Talabati',
    'experience.talabati.role': 'Mobile / Backend Developer',
    'experience.talabati.period': 'May 2025 – January 2026',
    'experience.talabati.point1': 'Developed the mobile application front-end using Kotlin and Jetpack Compose.',
    'experience.talabati.point2': 'Built and maintained the user-facing back-end API using ASP.NET Core (.NET 8).',
    'experience.talabati.point3': 'Engineered the back-end infrastructure for both the Admin and Company control panels, focusing on institutional management systems for branches and orders.',
    'experience.omega.company': 'Omega Education',
    'experience.omega.role': 'Full Stack Developer',
    'experience.omega.period': 'July 2024 – April 2025',
    'experience.omega.point1': 'Developed an integrated platform for hosting recorded courses and conducting online examinations.',
    'experience.omega.point2': 'Implemented an automated scoring and evaluation system to streamline the online testing process.',

    // Education
    'education.title': 'Education',
    'education.degree': 'B.Sc. in Computer Engineering',
    'education.university': 'Sakarya University',
    'education.location': 'Sakarya, Turkey',
    'education.period': '2023 - 2027',

    // Additional (Languages & Soft Skills)
    'additional.title': 'Languages & Soft Skills',
    'additional.languages': 'Languages',
    'additional.softSkills': 'Soft Skills',
    'additional.lang.arabic': 'Arabic',
    'additional.lang.turkish': 'Turkish',
    'additional.lang.english': 'English',
    'additional.lang.native': 'Native',
    'additional.lang.fluent': 'Fluent',
    'additional.lang.intermediate': 'Intermediate',
    'additional.soft.problemSolving': 'Problem Solving',
    'additional.soft.adaptability': 'Adaptability',
    'additional.soft.fastLearner': 'Fast Learner',
    'additional.soft.communication': 'Effective Communication',

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
    'nav.experience': 'الخبرة',
    'nav.education': 'التعليم',
    'nav.additional': 'المزيد',
    'nav.contact': 'تواصل',

    // Hero
    'hero.greeting': 'مرحباً، أنا',
    'hero.name': 'صلاح الدين',
    'hero.title': 'مهندس حاسوب',
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

    'projects.diff.title': 'Diff',
    'projects.diff.role': 'مطور Full-Stack',
    'projects.diff.desc': 'متجر إلكتروني لبيع الألبسة العصرية. مبني باستخدام React، Vite، Tailwind CSS، و Shadcn UI. يتضمن قاعدة بيانات Supabase، و React Query لجلب البيانات، ودعم تعدد اللغات.',

    'projects.ghiras.title': 'غراس 26 — نادي نواة',
    'projects.ghiras.role': 'مطور Full-Stack',
    'projects.ghiras.desc': 'نظام إدارة إفطار رمضان مبني باستخدام Next.js App Router. يتميز بواجهة متجاوبة مع Tailwind CSS ويدمج بين PostgreSQL و SQLite لإدارة البيانات، مع BcryptJS للمصادقة الآمنة.',

    'projects.omega.title': 'Omega Education',
    'projects.omega.role': 'مطور Full-Stack',
    'projects.omega.desc': 'منصة تعليمية متكاملة تشمل الدورات المسجلة وقسم الوظائف وأوراق العمل، مع نظام تقديم امتحانات إلكتروني احترافي يحاكي تجربة امتحانات TR-YÖS، مدعوم بمحرك تصحيح وتقييم آلي متقدم.',

    // Experience
    'experience.title': 'الخبرة العملية',
    'experience.talabati.company': 'طلباتي',
    'experience.talabati.role': 'مطور موبايل / باك إند',
    'experience.talabati.period': 'مايو 2025 – يناير 2026',
    'experience.talabati.point1': 'تطوير واجهة تطبيق الموبايل باستخدام Kotlin و Jetpack Compose.',
    'experience.talabati.point2': 'بناء وصيانة الـ API الخاص بالمستخدمين باستخدام ASP.NET Core (.NET 8).',
    'experience.talabati.point3': 'هندسة البنية التحتية للباك إند للوحتي تحكم الإدارة والشركات، مع التركيز على أنظمة الإدارة المؤسسية للفروع والطلبات.',
    'experience.omega.company': 'Omega Education',
    'experience.omega.role': 'مطور Full Stack',
    'experience.omega.period': 'يوليو 2024 – أبريل 2025',
    'experience.omega.point1': 'تطوير منصة متكاملة لاستضافة الدورات المسجلة وإجراء الامتحانات عبر الإنترنت.',
    'experience.omega.point2': 'تنفيذ نظام تقييم وتصحيح آلي لتبسيط عملية الاختبارات الإلكترونية.',

    // Education
    'education.title': 'التعليم',
    'education.degree': 'بكالوريوس في هندسة الحاسوب',
    'education.university': 'جامعة سكاريا',
    'education.location': 'سكاريا، تركيا',
    'education.period': '2023 - 2027',

    // Additional (Languages & Soft Skills)
    'additional.title': 'اللغات والمهارات الشخصية',
    'additional.languages': 'اللغات',
    'additional.softSkills': 'المهارات الشخصية',
    'additional.lang.arabic': 'العربية',
    'additional.lang.turkish': 'التركية',
    'additional.lang.english': 'الإنجليزية',
    'additional.lang.native': 'لغة أم',
    'additional.lang.fluent': 'بطلاقة',
    'additional.lang.intermediate': 'متوسط',
    'additional.soft.problemSolving': 'حل المشكلات',
    'additional.soft.adaptability': 'القدرة على التكيف',
    'additional.soft.fastLearner': 'سرعة التعلم',
    'additional.soft.communication': 'التواصل الفعّال',

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
