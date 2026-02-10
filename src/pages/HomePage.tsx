import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import PainPoints from '@/components/home/PainPoints';
import Workflow from '@/components/home/Workflow';
import Scenarios from '@/components/home/Scenarios';
import Features from '@/components/home/Features';
import Stats from '@/components/home/Stats';
import Testimonials from '@/components/home/Testimonials';
import Pricing from '@/components/home/Pricing';
import FAQ from '@/components/home/FAQ';
import CTASection from '@/components/home/CTASection';
import { useABTesting } from '@/hooks/useABTesting';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function HomePage() {
  const variants = useABTesting();
  const { track } = useAnalytics();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Track page view
    track('page_view', { page: 'home' });
    
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            track('anchor_click', { href });
          }
        }
      }
    };
    
    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, [track]);

  if (!isLoaded) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="page">
      <Header />
      
      <main>
        <HeroSection variants={variants} />
        <PainPoints />
        <Workflow />
        <Scenarios />
        <Features />
        <Stats />
        <Testimonials variants={variants} />
        <Pricing variants={variants} />
        <FAQ />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
