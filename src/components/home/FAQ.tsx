import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '@/constants/faq';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { track } = useAnalytics();

  const toggleFAQ = (index: number) => {
    const newIndex = openIndex === index ? null : index;
    setOpenIndex(newIndex);
    
    if (newIndex !== null) {
      track('faq_expand', { question: FAQ_ITEMS[index].question });
    }
  };

  return (
    <section id="faq" className="section bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">常见问题</h2>
          <p className="text-text-secondary">解答您的疑惑</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className={`card transition-all ${openIndex === idx ? 'border-primary' : ''}`}
            >
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => toggleFAQ(idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="font-medium pr-4">{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-text-secondary flex-shrink-0 transition-transform ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === idx && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-text-secondary leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
