import { ArrowRight } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { COMPANY_INFO } from '@/constants';

export default function CTASection() {
  const { track } = useAnalytics();

  return (
    <section className="bottom-cta py-20 text-white">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              把冷线索变"可达对话"，从今天开始
            </h2>
            <p className="text-white/70 text-lg mb-8">
              联脉让外联更高效、更合规、更具可验证性。
            </p>
            <a
              href="#pricing"
              className="btn bg-white text-[#0b1020] hover:bg-white/90"
              onClick={() => track('cta_click_hero')}
            >
              立即开始
              <ArrowRight size={18} className="ml-2" />
            </a>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-semibold mb-6">联系我们</h3>
            <div className="space-y-4">
              <div>
                <p className="text-white/50 text-sm mb-1">邮箱</p>
                <a
                  href={`mailto:${COMPANY_INFO.email}`}
                  className="text-white hover:text-primary transition-colors"
                >
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">电话</p>
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="text-white hover:text-primary transition-colors"
                >
                  {COMPANY_INFO.phone}
                </a>
              </div>
              <div>
                <p className="text-white/50 text-sm mb-1">微信</p>
                <p className="text-white">扫码添加微信咨询</p>
                <div className="w-24 h-24 bg-white/10 rounded-lg mt-2 flex items-center justify-center">
                  <span className="text-white/30 text-xs">二维码</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
