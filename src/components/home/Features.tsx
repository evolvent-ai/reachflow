import { useState } from 'react';
import { Target, Share2, BarChart3, FileCheck, Shield, Plug, Info } from 'lucide-react';
import { FEATURES } from '@/constants/features';
import { useAnalytics } from '@/hooks/useAnalytics';
import Drawer from '@/components/ui/Drawer';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  target: Target,
  channels: Share2,
  chart: BarChart3,
  'file-text': FileCheck,
  shield: Shield,
  plug: Plug,
};

export default function Features() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { track } = useAnalytics();

  const openComplianceDrawer = () => {
    setIsDrawerOpen(true);
    track('compliance_view');
  };

  return (
    <section className="section bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">关键能力，兼顾可解释与合规</h2>
          <button
            onClick={openComplianceDrawer}
            className="inline-flex items-center gap-2 mt-4 text-primary hover:text-primary-dark text-sm font-medium"
          >
            <Info size={16} />
            了解合规细则
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = iconMap[feature.icon];
            return (
              <div key={feature.title} className="card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  {Icon && <Icon size={24} className="text-primary" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="合规细则"
      >
        <div className="space-y-6">
          <section>
            <h3 className="font-semibold mb-2">数据来源</h3>
            <p className="text-text-secondary text-sm">
              我们仅使用公开与合规渠道（官网、公开名录、企业数据库、公开社媒入口等），不处理受保护的私人数据。
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">频控与拒联</h3>
            <p className="text-text-secondary text-sm">
              内置频控与拒联名录，支持退订链接与合规文案，保障触达策略不超频、不冒进。
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">审计与日志</h3>
            <p className="text-text-secondary text-sm">
              来源链接、验证轨迹、外联日志完整可导出，形成证据链，满足合规审计要求。
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">数据驻留</h3>
            <p className="text-text-secondary text-sm">
              企业版支持数据驻留配置，确保敏感数据不出境，满足数据主权要求。
            </p>
          </section>
        </div>
      </Drawer>
    </section>
  );
}
