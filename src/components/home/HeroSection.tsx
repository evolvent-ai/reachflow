import { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';
import type { ABVariants } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import { isValidContact } from '@/utils/validators';
import { SCENARIO_OPTIONS, VOLUME_OPTIONS } from '@/constants';
import Toast from '@/components/ui/Toast';

interface HeroSectionProps {
  variants: ABVariants;
}

// Logo 墙数据
const LOGOS = [
  { name: 'GitHub', src: '/logos/github_logo.svg' },
  { name: 'LinkedIn', src: '/logos/linkedin_logo.svg' },
  { name: 'Gmail', src: '/logos/gmail_logo.svg' },
  { name: 'HubSpot', src: '/logos/hubspot_logo.svg' },
  { name: 'X', src: '/logos/x_logo.svg' },
];

// 淡入动画 Hook
function useFadeIn(delay: number = 0) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return { ref, isVisible };
}

export default function HeroSection({ variants }: HeroSectionProps) {
  const { track } = useAnalytics();
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    scenario: '',
    market: '',
    volume: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastVisible, setToastVisible] = useState(false);

  // 各个区块的淡入动画
  const titleAnim = useFadeIn(0);
  const descAnim = useFadeIn(100);
  const badgesAnim = useFadeIn(200);
  const logoWallAnim = useFadeIn(300);
  const formAnim = useFadeIn(200);

  const h1Text = variants.h1 === 'B'
    ? '首批可联对象，T+24 必达'
    : '找到对的人，24 小时内让他看到你';

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    track('form_start', { field });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = '请输入公司名称';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = '请输入联系方式';
    } else if (!isValidContact(formData.contact)) {
      newErrors.contact = '请输入有效的邮箱、手机号或微信号';
    }
    if (!formData.scenario) {
      newErrors.scenario = '请选择使用场景';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      track('form_submit_fail', { reason: 'validation_error' });
      return;
    }

    track('form_submit_success', formData);
    setToastVisible(true);
    setFormData({
      company: '',
      contact: '',
      scenario: '',
      market: '',
      volume: '',
    });
  };

  return (
    <section className="pt-32 pb-20 hero-bg overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="max-w-xl">
            {/* AI 外联引擎标签 */}
            <div
              ref={titleAnim.ref}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 transition-all duration-700 ${
                titleAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI 外联引擎
            </div>

            {/* 主标题 */}
            <h1
              ref={titleAnim.ref}
              className={`text-4xl md:text-5xl font-bold text-text leading-tight mb-6 transition-all duration-700 delay-100 ${
                titleAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              联脉｜{h1Text}
            </h1>

            {/* 描述 */}
            <p
              ref={descAnim.ref}
              className={`text-lg text-text-secondary mb-8 leading-relaxed transition-all duration-700 delay-200 ${
                descAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              用 AI 精准识别企业关键联系人，补全多通道触达方式，并验证可达性。一键外联，拒绝盲打骚扰。
            </p>

            {/* 特性标签 */}
            <div
              ref={badgesAnim.ref}
              className={`flex flex-wrap gap-3 mb-8 transition-all duration-700 delay-300 ${
                badgesAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="badge hover:scale-105 transition-transform duration-300">
                <CheckCircle size={16} className="text-secondary mr-2" />
                覆盖场景：外贸获客｜影响者投放｜招聘寻源｜公关传播
              </span>
              <span className="badge hover:scale-105 transition-transform duration-300">
                <CheckCircle size={16} className="text-secondary mr-2" />
                可达验证：邮箱投递/电话有效/渠道属性
              </span>
              <span className="badge hover:scale-105 transition-transform duration-300">
                <CheckCircle size={16} className="text-secondary mr-2" />
                合规守护：仅使用公开数据｜拒联名录｜全链路审计
              </span>
            </div>

            {/* 承诺 + Logo 墙 */}
            <div
              ref={logoWallAnim.ref}
              className={`transition-all duration-700 delay-400 ${
                logoWallAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-sm text-text-secondary mb-4">
                承诺：T+24 小时返回 3–5 位可联对象（含可达评分与触达路径）
              </p>

              {/* Logo 墙 */}
              <div className="flex items-center gap-4 flex-wrap">
                {LOGOS.map((logo, index) => (
                  <div
                    key={logo.name}
                    className="w-12 h-12 rounded-xl bg-white border border-[#e5e7eb] flex items-center justify-center p-2.5 hover:shadow-lg hover:scale-110 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                    title={logo.name}
                  >
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div
            ref={formAnim.ref}
            className={`card shadow-lg hover:shadow-xl transition-all duration-700 delay-200 ${
              formAnim.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <h3 className="text-xl font-semibold mb-6">立即获取首批联系人</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">公司名称 *</label>
                <input
                  type="text"
                  placeholder="公司名称 *"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className={`input w-full ${errors.company ? 'border-error' : ''}`}
                />
                {errors.company && (
                  <p className="text-error text-sm mt-1">{errors.company}</p>
                )}
                <p className="text-text-secondary text-xs mt-1">我们将结合公开信息补全组织图谱</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">联系方式（工作邮箱 / 微信） *</label>
                <input
                  type="text"
                  placeholder="联系方式（工作邮箱 / 微信） *"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  className={`input w-full ${errors.contact ? 'border-error' : ''}`}
                />
                {errors.contact && (
                  <p className="text-error text-sm mt-1">{errors.contact}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">使用场景 *</label>
                <select
                  value={formData.scenario}
                  onChange={(e) => handleInputChange('scenario', e.target.value)}
                  className={`input w-full ${errors.scenario ? 'border-error' : ''}`}
                  style={{
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '36px',
                  }}
                >
                  <option value="">请选择使用场景</option>
                  {SCENARIO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.scenario && (
                  <p className="text-error text-sm mt-1">{errors.scenario}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">目标国家 / 行业（可选）</label>
                <input
                  type="text"
                  placeholder="目标国家 / 行业（可选）"
                  value={formData.market}
                  onChange={(e) => handleInputChange('market', e.target.value)}
                  className="input w-full"
                />
              </div>

              {(variants.formFields === 'extended' || variants.formFields === '5') && (
                <>
                  <select
                    value={formData.volume}
                    onChange={(e) => handleInputChange('volume', e.target.value)}
                    className="input w-full"
                    style={{
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px',
                    }}
                  >
                    <option value="">预估月外联量</option>
                    {VOLUME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                提交
              </button>

              <p className="text-text-secondary text-sm text-center">
                提交后我们将在 24 小时内邮件或微信联系你。
              </p>
            </form>
          </div>
        </div>
      </div>

      <Toast
        message="提交成功！我们将在 24 小时内联系你。"
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </section>
  );
}
