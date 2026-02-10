import { STATS } from '@/constants/features';

export default function Stats() {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">指标与 SLA，给你可验证的信任</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-text-secondary text-sm mt-6">
          数据基于内测区间，视行业与地区而定。
        </p>
      </div>
    </section>
  );
}
