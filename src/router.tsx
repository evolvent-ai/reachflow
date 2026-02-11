import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import ResearchPage from './pages/ResearchPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'research',
        element: (
          <ProtectedRoute>
            <ResearchPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-in/*',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/sign-up/*',
    element: <SignUpPage />,
  },
  // 404 页面 - 必须放在最后
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
