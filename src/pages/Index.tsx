import { LanguageProvider } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Education from '@/components/Education';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <LanguageProvider>
      <Helmet>
        <title>Salah Elden | Software Engineer</title>
        <meta name="description" content="Software Engineer specialized in ASP.NET Core backend development and native Android with Kotlin. Building scalable systems and solving complex problems." />
        <meta name="keywords" content="Software Engineer, Backend Developer, ASP.NET Core, Kotlin, Android Developer, Full Stack Developer" />
        <meta property="og:title" content="Salah Elden | Software Engineer" />
        <meta property="og:description" content="Building Scalable Systems. Solving Complex Problems." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Salah Elden | Software Engineer" />
        <meta name="twitter:description" content="Building Scalable Systems. Solving Complex Problems." />
        <link rel="canonical" href="https://salahelden.dev" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Education />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
