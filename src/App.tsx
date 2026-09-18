import { ToastProvider } from './components/Toast';
import CustomCursor from './components/CustomCursor';
import HeroSection from './sections/HeroSection';
import MarqueeSection from './sections/MarqueeSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import ProjectsSection from './sections/ProjectsSection';
import ContactSection from './sections/ContactSection';

export default function App() {
  return (
    <ToastProvider>
      <main className="relative min-h-screen" style={{ overflowX: 'clip' }}>
        <HeroSection />
        {/* Everything below the hero, marquee, about, services, projects,
            contact, sits on the near-black pixel field (rest-bg). */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              backgroundImage: 'url(/assets/rest-bg.png)',
              backgroundSize: 'auto 100vh',
              backgroundPosition: 'top center',
              backgroundRepeat: 'repeat',
            }}
          />
          <MarqueeSection />
          <AboutSection />
          <ServicesSection />
          <ProjectsSection />
          <ContactSection />
        </div>
      </main>
      <CustomCursor />
    </ToastProvider>
  );
}
