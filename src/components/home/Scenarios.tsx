import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { SCENARIOS, SCENARIO_TEMPLATES } from '@/constants/scenarios';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';

export default function Scenarios() {
  const [activeTab, setActiveTab] = useState('foreign_trade');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('foreign_trade');
  const { track } = useAnalytics();

  const activeScenario = SCENARIOS.find(s => s.id === activeTab);

  const headerAnim = useScrollAnimation();
  const buttonAnim = useScrollAnimation();
  const tabsAnim = useScrollAnimation();
  const contentAnim = useScrollAnimation();

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('no-scroll');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('no-scroll');
    };
  }, [isModalOpen]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    track('scenario_tab_click', { scenario: id });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setModalTab(activeTab);
    track('template_modal_view');
  };

  return (
    <section id="scenarios" className="section bg-white">
      <div className="container">
        <div 
          ref={headerAnim.ref}
          className={`text-center mb-12 transition-all duration-700 ${
            headerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">三大优先场景</h2>
          <p className="text-text-secondary">覆盖外贸、影响者投放、招聘寻源，立即启用可达触达工具。</p>
        </div>

        {/* View Templates Button */}
        <div 
          ref={buttonAnim.ref}
          className={`text-center mb-8 transition-all duration-700 delay-100 ${
            buttonAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={openModal}
            className="btn btn-secondary hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <FileText size={18} className="mr-2" />
            查看样例外联文案
          </button>
        </div>

        {/* Tabs */}
        <div 
          ref={tabsAnim.ref}
          className={`flex flex-wrap justify-center gap-3 mb-8 transition-all duration-700 delay-200 ${
            tabsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          role="tablist"
        >
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              role="tab"
              aria-selected={activeTab === scenario.id}
              onClick={() => handleTabChange(scenario.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all hover:scale-105 ${
                activeTab === scenario.id
                  ? 'bg-primary text-white'
                  : 'bg-background text-text hover:bg-primary/10'
              }`}
            >
              {scenario.title}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeScenario && (
          <div 
            ref={contentAnim.ref}
            className={`card max-w-3xl mx-auto transition-all duration-700 delay-300 ${
              contentAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h3 className="text-xl font-semibold mb-4">{activeScenario.title}</h3>
            <p className="text-text-secondary mb-6">{activeScenario.description}</p>
            <ul className="space-y-3">
              {activeScenario.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white rounded-[20px] max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">样例外联文案</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-text-secondary hover:text-text hover:scale-110 transition-all duration-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 min-h-0">
                <div className="flex gap-2 mb-6 flex-shrink-0">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setModalTab(s.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                        modalTab === s.id
                          ? 'bg-primary text-white'
                          : 'bg-background text-text hover:bg-primary/10'
                      }`}
                    >
                      {s.id === 'foreign_trade' ? '外贸（英文）' : s.id === 'marketing' ? '投放（中文）' : '招聘（中文）'}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {SCENARIO_TEMPLATES[modalTab]?.map((template, idx) => (
                    <div key={idx} className="p-4 bg-background rounded-xl hover:shadow-md transition-shadow duration-300">
                      <h4 className="font-medium mb-2">{template.title}</h4>
                      <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans">
                        {template.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
