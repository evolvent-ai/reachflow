import { useState } from 'react';
import { FileText } from 'lucide-react';
import { SCENARIOS, SCENARIO_TEMPLATES } from '@/constants/scenarios';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function Scenarios() {
  const [activeTab, setActiveTab] = useState('foreign_trade');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('foreign_trade');
  const { track } = useAnalytics();

  const activeScenario = SCENARIOS.find(s => s.id === activeTab);

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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">三大优先场景</h2>
          <p className="text-text-secondary">覆盖外贸、影响者投放、招聘寻源，立即启用可达触达工具。</p>
        </div>

        {/* View Templates Button */}
        <div className="text-center mb-8">
          <button
            onClick={openModal}
            className="btn btn-secondary"
          >
            <FileText size={18} className="mr-2" />
            查看样例外联文案
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8" role="tablist">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              role="tab"
              aria-selected={activeTab === scenario.id}
              onClick={() => handleTabChange(scenario.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
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
          <div className="card max-w-3xl mx-auto">
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
              className="bg-white rounded-[20px] max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">样例外联文案</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-text-secondary hover:text-text"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex gap-2 mb-6">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setModalTab(s.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        modalTab === s.id
                          ? 'bg-primary text-white'
                          : 'bg-background text-text hover:bg-primary/10'
                      }`}
                    >
                      {s.id === 'foreign_trade' ? '英文' : '中文'}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {SCENARIO_TEMPLATES[modalTab]?.map((template, idx) => (
                    <div key={idx} className="p-4 bg-background rounded-xl">
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
