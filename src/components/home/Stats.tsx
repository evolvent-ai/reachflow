import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';
import { STATS } from '@/constants/features';

export default function Stats() {
  const headerAnim = useScrollAnimation();
  const statsAnim = useStaggeredAnimation(STATS.length, 100);
  const footerAnim = useScrollAnimation();

  return (
    <section className="section bg-white">
      <div className="container">
        <div 
          ref={headerAnim.ref}
          className={`text-center mb-12 transition-all duration-700 ${
            headerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">指标与 SLA，给你可验证的信任</h2>
        </div>
        <div 
          ref={statsAnim.ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {STATS.map((stat, index) => (
            <div 
              key={stat.label} 
              className={`card text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ${
                statsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${statsAnim.getDelay(index)}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
        <p 
          ref={footerAnim.ref}
          className={`text-center text-text-secondary text-sm mt-6 transition-all duration-700 delay-300 ${
            footerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          数据基于内测区间，视行业与地区而定。
        </p>
      </div>
    </section>
  );
}
