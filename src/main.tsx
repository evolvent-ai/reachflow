import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// 检查 key 是否有效（Clerk 的 key 必须以 pk_test_ 或 pk_live_ 开头，且长度要足够）
const isValidClerkKey = publishableKey && (
  publishableKey.startsWith('pk_test_') || 
  publishableKey.startsWith('pk_live_')
) && publishableKey.length > 50;

// 创建应用根节点
const root = createRoot(document.getElementById('root')!);

// 如果没有有效的 key，直接渲染应用（无认证功能）
if (!isValidClerkKey) {
  console.warn(
    '[Clerk] Invalid or missing publishableKey. ' +
    'Authentication features will be disabled. ' +
    'Please add a valid VITE_CLERK_PUBLISHABLE_KEY to your .env file. ' +
    'Get your key at https://dashboard.clerk.com/last-active?path=api-keys'
  );
  
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
} else {
  // 有有效的 key，动态导入 Clerk 并渲染
  import('@clerk/clerk-react').then(({ ClerkProvider }) => {
    root.render(
      <StrictMode>
        <ClerkProvider
          publishableKey={publishableKey}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          afterSignUpUrl="/"
        >
          <RouterProvider router={router} />
        </ClerkProvider>
      </StrictMode>
    );
  });
}
