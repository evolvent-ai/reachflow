import { Search, Contact, Send } from 'lucide-react';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

const steps = [
  {
    icon: Search,
    number: '1',
    title: '目标对象发现',
    description: '输入公司名、岗位或领域标签，自动识别企业内部最合适的联系人（市场总监、HR、CEO…）。',
  },
  {
    icon: Contact,
    number: '2',
    title: '联系方式补全 & 可达验证',
    description: '补全邮箱、电话、官网表单、社媒入口；验证投递性、有效性、渠道属性，输出可达评分。',
  },
  {
    icon: Send,
    number: '3',
    title: '一键外联与编排',
    description: '生成个性化外联文案（支持多语言），邮箱/表单/社媒并行发送，自动去重与频控。',
  },
];

export default function Workflow() {
  const headerAnim = useScrollAnimation();
  const stepsAnim = useStaggeredAnimation(steps.length, 200);

  return (
    <section id="workflow" className="section bg-background">
      <div className="container">
        <div 
          ref={headerAnim.ref}
          className={`text-center mb-12 transition-all duration-700 ${
            headerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">三步工作流，从目标锁定到合规触达</h2>
        </div>

        <div 
          ref={stepsAnim.ref}
          className="grid md:grid-cols-3 gap-8 relative"
        >
          {/* Connection lines for desktop */}
          <div className={`hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 transition-all duration-1000 delay-500 ${
            stepsAnim.isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`} style={{ transformOrigin: 'left' }} />

          {steps.map((step, index) => (
            <div 
              key={step.number} 
              className={`relative text-center transition-all duration-700 ${
                stepsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${stepsAnim.getDelay(index)}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6 relative z-10 hover:scale-110 hover:shadow-lg transition-all duration-300 cursor-default">
                {step.number}
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                <step.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
