import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

// 动态导入 Clerk 组件
const SignIn = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignIn })));

// 加载占位符
const SignInFallback = () => (
  <div className="w-full max-w-md mx-auto">
    <div className="bg-white shadow-card rounded-card p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
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
          </div>
        </div>
      </header>

      {/* Sign In Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text mb-2">欢迎回来</h1>
            <p className="text-text-secondary">登录您的联脉账户</p>
          </div>
          
          <Suspense fallback={<SignInFallback />}>
            <SignIn 
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'bg-white shadow-card rounded-card',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton: 'border-border hover:bg-background',
                  formFieldLabel: 'text-text',
                  formFieldInput: 'input',
                  formButtonPrimary: 'btn btn-primary w-full',
                  footerActionLink: 'text-primary hover:text-primary-dark',
                },
              }}
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
            />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-4">
        <div className="container">
          <p className="text-center text-text-secondary text-sm">
            © {new Date().getFullYear()} 联脉科技
          </p>
        </div>
      </footer>
    </div>
  );
}
