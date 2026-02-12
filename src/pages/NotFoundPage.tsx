import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb]">
        <div className="container">
          <div className="flex items-center justify-between h-[72px]">
            <Link to="/" className="flex items-center gap-3">
              <img src="/icon.png" alt="联脉" className="w-10 h-10 rounded-xl" />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-bold text-[#111827]">联脉</span>
                <span className="text-xs text-[#6b7280]">ReachFlow</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-[rgba(47,111,237,0.1)] rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-primary">404</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-[#111827] mb-3">
            页面未找到
          </h1>
          <p className="text-[#6b7280] mb-8">
            抱歉，您访问的页面不存在或已被移除
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="btn btn-secondary flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              返回上一页
            </button>
            <Link to="/" className="btn btn-primary flex items-center justify-center gap-2">
              <Home size={18} />
              返回首页
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e5e7eb] py-4">
        <div className="container">
          <p className="text-center text-[#6b7280] text-sm">
            © {new Date().getFullYear()} 联脉 ReachFlow
          </p>
        </div>
      </footer>
    </div>
  );
}
