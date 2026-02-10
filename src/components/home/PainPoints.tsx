import { Users, PhoneOff, ShieldAlert } from 'lucide-react';

const painPoints = [
  {
    icon: Users,
    title: '线索分散 → 定位关键人难',
    description: '官网、社媒、活动、企业库信息割裂，难以识别真正能决策的人。',
  },
  {
    icon: PhoneOff,
    title: '联系方式不可靠 → 触达成本高',
    description: '退信、停机、表单无回复，浪费时间与预算，团队外联效率低。',
  },
  {
    icon: ShieldAlert,
    title: '合规风险 → 品牌受损',
    description: '无授权抓取、频繁打扰、缺乏退订机制，易触发投诉与罚款。',
  },
];

export default function PainPoints() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">线索分散、触达困难、合规风险？我们一次解决</h2>
          <p className="text-text-secondary">直面现状痛点，联脉以可解释流程交付可达线索。</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {painPoints.map((point) => (
            <div key={point.title} className="card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <point.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
              <p className="text-text-secondary text-sm">{point.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-lg">
            <span className="font-semibold text-primary">我们的方式：</span>
            <span className="text-text-secondary"> 可解释 AI 流程把"找谁—怎么联系—是否能达"一次解决。</span>
          </p>
        </div>
      </div>
    </section>
  );
}
