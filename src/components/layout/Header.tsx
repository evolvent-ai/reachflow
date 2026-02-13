import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { NAV_LINKS } from '@/constants';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePaymentStore } from '@/stores/paymentStore';
import { getCreditsBalance } from '@/services/payment.api';

// 动态导入 Clerk 组件
const SignedIn = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignedIn })));
const SignedOut = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignedOut })));
const UserButton = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.UserButton })));

// 加载占位符
const ClerkFallback = () => <div className="w-9 h-9" />;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { track } = useAnalytics();
  const { credits, setCredits } = usePaymentStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 加载积分余额
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const balance = await getCreditsBalance();
        setCredits(balance);
      } catch (error) {
        // 未登录时不显示错误
        console.log('Failed to load credits:', error);
      }
    };
    loadCredits();
  }, [setCredits]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isMenuOpen]);

  const handleNavClick = (label: string) => {
    track('nav_click', { label });
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={() => track('logo_click')}>
            <img 
              src="/icon.png" 
              alt="联脉" 
              className="w-10 h-10 rounded-lg"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-text leading-tight">联脉</span>
              <span className="text-xs text-text-secondary leading-tight">ReachFlow</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-[15px] text-text hover:text-primary transition-colors py-2 group"
                onClick={() => handleNavClick(link.label)}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Suspense fallback={<ClerkFallback />}>
              <SignedOut>
                <button
                  className="btn btn-outline"
                  onClick={() => track('demo_request')}
                >
                  预约 Demo
                </button>
                <a
                  href="#pricing"
                  className="btn btn-primary"
                  onClick={() => track('cta_click_hero')}
                >
                  获取首批联系人
                </a>
              </SignedOut>
            </Suspense>
            <Suspense fallback={<ClerkFallback />}>
              <SignedIn>
                <Link
                  to="/pricing"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                  onClick={() => track('credits_nav_click')}
                >
                  <Zap size={16} />
                  <span>{credits?.credits ?? 0} 积分</span>
                </Link>
                <Link
                  to="/research"
                  className="btn btn-secondary text-sm"
                  onClick={() => track('research_nav_click')}
                >
                  AI 背调
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9',
                    },
                  }}
                />
              </SignedIn>
            </Suspense>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] bg-white z-40">
          <nav className="container py-6 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-lg text-text hover:text-primary py-3 border-b border-border"
                onClick={() => handleNavClick(link.label)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Suspense fallback={null}>
                <SignedOut>
                  <button
                    className="btn btn-outline w-full justify-center"
                    onClick={() => {
                      track('demo_request');
                      setIsMenuOpen(false);
                    }}
                  >
                    预约 Demo
                  </button>
                  <a
                    href="#pricing"
                    className="btn btn-primary w-full justify-center"
                    onClick={() => {
                      track('cta_click_hero');
                      setIsMenuOpen(false);
                    }}
                  >
                    获取首批联系人
                  </a>
                </SignedOut>
              </Suspense>
              <Suspense fallback={null}>
                <SignedIn>
                  <Link
                    to="/research"
                    className="btn btn-secondary w-full justify-center"
                    onClick={() => {
                      track('research_nav_click');
                      setIsMenuOpen(false);
                    }}
                  >
                    AI 背调
                  </Link>
                  <a
                    href="#pricing"
                    className="btn btn-primary w-full justify-center"
                    onClick={() => {
                      track('cta_click_hero');
                      setIsMenuOpen(false);
                    }}
                  >
                    获取首批联系人
                  </a>
                  <div className="flex justify-center py-2">
                    <UserButton />
                  </div>
                </SignedIn>
              </Suspense>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
