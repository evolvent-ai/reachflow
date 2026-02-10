import { Check } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import type { ABVariants } from '@/types';

interface PricingProps {
  variants: ABVariants;
}

const features = [
  '席位与验证额度可灵活增减',
  '可选 CRM/ATS 回写、审计与数据驻留能力',
  '顾问协助 Demo、试用与落地部署',
];

export default function Pricing({ variants }: PricingProps) {
  const { track } = useAnalytics();

  const handleClick = () => {
    track('pricing_select');
  };

  return (
    <section id="pricing" className="section bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">价格与方案</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card shadow-pricing border-2 border-primary">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">企业方案</h3>
              <p className="text-text-secondary mb-6">
                我们会基于团队规模、外联场景与风险要求，组合席位、验证用量与合规模块，为你提供最佳方案建议。
              </p>
              
              {variants.pricing === 'hidden' ? (
                <div className="text-3xl font-bold text-primary">联系我们获取报价</div>
              ) : (
                <div className="text-3xl font-bold text-primary">按需定价</div>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check size={20} className="text-secondary flex-shrink-0 mt-0.5" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleClick}
              className="btn btn-primary w-full"
            >
              联系销售
            </button>

            <p className="text-center text-text-secondary text-sm mt-4">
              支持年付/季付，可随时调整配置
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
