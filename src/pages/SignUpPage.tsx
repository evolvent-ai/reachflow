import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';

// 动态导入 Clerk 组件
const SignUp = lazy(() => import('@clerk/clerk-react').then(m => ({ default: m.SignUp })));

// 加载占位符
const SignUpFallback = () => (
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

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">联</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-text leading-tight">联脉</span>
                <span className="text-xs text-text-secondary leading-tight">ReachFlow</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Sign Up Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text mb-2">创建账户</h1>
            <p className="text-text-secondary">开始使用联脉 AI 外联引擎</p>
          </div>
          
          <Suspense fallback={<SignUpFallback />}>
            <SignUp 
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
              path="/sign-up"
              signInUrl="/sign-in"
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
