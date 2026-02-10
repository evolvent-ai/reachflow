import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// 动态导入 Clerk
let useAuth: (() => { isSignedIn: boolean; isLoaded: boolean }) | null = null;
let clerkLoaded = false;

try {
  const clerk = require('@clerk/clerk-react');
  useAuth = clerk.useAuth;
  clerkLoaded = true;
} catch {
  // Clerk 未加载
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  // 如果没有 Clerk，直接允许访问
  if (!clerkLoaded || !useAuth) {
    return <>{children}</>;
  }

  // 有 Clerk 时检查登录状态
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
