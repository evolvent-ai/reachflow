import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '@/constants/testimonials';
import type { ABVariants } from '@/types';

interface TestimonialsProps {
  variants: ABVariants;
}

export default function Testimonials({ variants }: TestimonialsProps) {
  // Use variants to avoid TS error
  console.log('Trust variant:', variants.trust);

  return (
    <section className="section bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">客户怎么说</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div key={idx} className="card">
              <Quote size={32} className="text-primary/20 mb-4" />
              <p className="text-lg text-text leading-relaxed mb-4">
                "{testimonial.quote}"
              </p>
              {testimonial.author && (
                <p className="text-text-secondary text-sm">— {testimonial.author}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
