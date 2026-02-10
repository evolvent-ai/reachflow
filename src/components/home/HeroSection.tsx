import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import type { ABVariants } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import { isValidContact } from '@/utils/validators';
import { SCENARIO_OPTIONS, VOLUME_OPTIONS } from '@/constants';
import Toast from '@/components/ui/Toast';

interface HeroSectionProps {
  variants: ABVariants;
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
    <section className="pt-32 pb-20 hero-bg">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              AI 外联引擎
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-text leading-tight mb-6">
              联脉｜{h1Text}
            </h1>
            
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">
              用 AI 精准识别企业关键联系人，补全多通道触达方式，并验证可达性。一键外联，拒绝盲打骚扰。
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <span className="badge">
                <CheckCircle size={16} className="text-secondary mr-2" />
                覆盖场景：外贸获客｜影响者投放｜招聘寻源｜公关传播
              </span>
              <span className="badge">
                <CheckCircle size={16} className="text-secondary mr-2" />
                可达验证：邮箱投递/电话有效/渠道属性
              </span>
              <span className="badge">
                <CheckCircle size={16} className="text-secondary mr-2" />
                合规守护：仅使用公开数据｜拒联名录｜全链路审计
              </span>
            </div>

            <p className="text-sm text-text-secondary">
              承诺：T+24 小时返回 3–5 位可联对象（含可达评分与触达路径）
            </p>
          </div>

          {/* Right Form */}
          <div className="card shadow-lg">
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
                  >
                    <option value="">预估月外联量</option>
                    {VOLUME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </>
              )}

              <button type="submit" className="btn btn-primary w-full">
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
