import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, X, Loader2, Octagon, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@clerk/clerk-react';
import { useResearchStore } from '@/stores/researchStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { streamResearch } from '@/services/research';
import { getCreditsBalance } from '@/services/payment.api';
import { PROVIDER_OPTIONS, type SSEEvent, type ProviderType, type ChatMessage } from '@/types/research';
import { formatTimestamp } from '@/utils/helpers';
import { router } from '@/router';

export default function ResearchPage() {
  const { track } = useAnalytics();
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 流式消息跟踪（类似原版 assistantStream）
  const assistantStreamRef = useRef<{
    message: ChatMessage | null;
    content: string;
  }>({ message: null, content: '' });

  const {
    messages,
    addMessage,
    updateLastMessage,
    finishStreaming,
    clearMessages,
    timeline,
    addTimelineEntry,
    clearTimeline,
    status,
    setStatus,
    settings,
    updateSettings,
  } = useResearchStore();

  // 全局积分状态
  const { credits, setCredits, isLoadingCredits, setIsLoadingCredits } = usePaymentStore();

  // 加载积分余额 - 等待 Clerk 加载完成后请求
  useEffect(() => {
    const loadCredits = async () => {
      // 等待 Clerk 加载完成
      if (!isLoaded) {
        setIsLoadingCredits(true);
        return;
      }

      // 只在用户已登录时加载积分
      if (!isSignedIn) {
        setCredits(null);
        setIsLoadingCredits(false);
        return;
      }

      setIsLoadingCredits(true);
      try {
        console.log('[ResearchPage] Loading credits for user:', userId);
        const balance = await getCreditsBalance();
        console.log('[ResearchPage] Credits loaded:', balance);
        setCredits(balance);
      } catch (error) {
        console.log('[ResearchPage] Failed to load credits:', error);
        setCredits(null);
      } finally {
        setIsLoadingCredits(false);
      }
    };
    loadCredits();
  }, [isLoaded, isSignedIn, userId, setCredits, setIsLoadingCredits]);

  // 刷新积分余额（供其他地方调用）
  const refreshCredits = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      console.log('[ResearchPage] Refreshing credits...');
      const balance = await getCreditsBalance();
      setCredits(balance);
    } catch (error) {
      console.log('[ResearchPage] Failed to refresh credits:', error);
    }
  }, [isSignedIn, setCredits]);

  useEffect(() => {
    track('page_view', { page: 'research' });
  }, [track]);

  useEffect(() => {
    // 只在有消息且不是初始加载时滚动
    if (messages.length > 0 && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // 自定义选择框组件
  interface CustomSelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }

  const CustomSelect = ({ label, value, options, onChange }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={selectRef}>
        <label className="block text-[12px] font-medium text-[#6b7280] mb-1.5 tracking-wide">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-[40px] pl-4 pr-10 text-sm font-medium text-[#111827] bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all duration-200 min-w-[140px] flex items-center justify-between ${
            isOpen ? 'border-primary ring-2 ring-primary/20' : 'border-[#e5e7eb] hover:border-primary/50 hover:shadow-sm'
          }`}
        >
          <span>{selectedOption?.label}</span>
          <div className={`absolute right-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-lg z-50 overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                  opt.value === value
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-[#111827] hover:bg-[#f3f4f6]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ESC 键关闭高级设置弹窗
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAdvanced) {
        setShowAdvanced(false);
      }
    };

    if (showAdvanced) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showAdvanced]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // 更新流式消息（更新最后一条 AI 消息）
  const updateAssistantStream = useCallback((chunk: string, _meta?: string) => {
    if (!chunk) return;

    // 直接更新最后一条消息的内容
    updateLastMessage(chunk);

    scrollToBottom();
  }, [updateLastMessage, scrollToBottom]);

  // 完成流式消息（关闭 loading 状态）
  const finalizeAssistantStream = useCallback((_finalText?: string) => {
    // 重置流式消息跟踪
    assistantStreamRef.current = { message: null, content: '' };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    if (!isSignedIn) {
      router.navigate('/sign-in');
      return;
    }

    const balance = await getCreditsBalance();
    if (balance.credits <= 0) {
        alert('积分不足，请充值');
        return;
    }

    const userMessage = query.trim();
    setQuery('');
    setIsLoading(true);
    setStatus('active');

    // 添加用户消息
    addMessage({
      role: 'user',
      content: userMessage,
    });

    // 立即添加 AI 回复占位（显示 loading）
    addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    });

    track('research_submit', { provider: settings.provider });

    const payload: Record<string, any> = {
      query: userMessage,
      provider: settings.provider,
    };

    if (settings.model) payload.model = settings.model;
    if (settings.baseUrl) payload.openai_base_url = settings.baseUrl;
    if (settings.exaKey) payload.exa_api_key = settings.exaKey;
    if (settings.apiKey) {
      const keyField = `${settings.provider}_api_key`;
      payload[keyField] = settings.apiKey;
    }

    try {
      abortControllerRef.current = new AbortController();
      
      // 重置时间线并添加任务创建日志
      clearTimeline();
      addTimelineEntry({
        type: 'task_created',
        title: '任务创建',
        description: '已提交任务',
      });

      for await (const event of streamResearch(payload as any, abortControllerRef.current.signal)) {
        handleStreamEvent(event);
      }
    } catch (error) {
      // 忽略所有错误，不显示错误提示
      // 流结束是正常行为，不需要显示错误
      console.log('Stream ended:', error);
    } finally {
      finalizeAssistantStream();
      setIsLoading(false);
      setStatus('idle');
      abortControllerRef.current = null;
    }
  };

  const handleStreamEvent = (event: SSEEvent) => {
    // 获取事件类型（优先从 event.event，然后是 event.type，最后是 event.data.event）
    const type = event.event || event.type || event.data?.event || 'message';
    // 获取数据（优先从 event.data，然后是 event 本身）
    const data = event.data ?? event;

    switch (type) {
      case 'assistant_message':
        updateAssistantStream(extractText(data), data?.meta || data?.model || data?.provider);
        break;
      case 'llm_request':
        addTimelineEntry({
          type: 'llm_request',
          title: 'LLM 请求',
          description: data?.model || data?.provider || '-',
        });
        break;
      case 'final':
        // final 事件只更新内容，不关闭 loading
        updateAssistantStream(extractText(data) || '', data?.meta);
        // 显示最终答案日志
        addTimelineEntry({
          type: 'final',
          title: '任务结束',
          description: '报告已生成',
        });
        break;
      case 'error':
        // 只有非流结束的错误才显示错误消息
        if (!data?.isClosing) {
          addMessage({
            role: 'error',
            content: data?.message || data?.detail || '发生错误',
          });
        }
        break;
      case 'close':
      case 'done':
        // 关闭最后一条消息的 loading 状态
        finishStreaming();
        finalizeAssistantStream();
        setStatus('idle');
        setIsLoading(false);
        // 对话结束后刷新积分（扣除积分后）
        refreshCredits();
        break;
      // 其他事件不显示在日志中
    }
  };

  // 提取文本内容（类似原版 extractText）
  const extractText = (data: any): string => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (typeof data.text === 'string') return data.text;
    if (typeof data.content === 'string') return data.content;
    if (Array.isArray(data.content)) {
      return data.content
        .map((part: any) => (typeof part === 'string' ? part : part.text || part.content || ''))
        .join('');
    }
    if (typeof data.result === 'string') return data.result;
    return '';
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    finalizeAssistantStream();
    setIsLoading(false);
    setStatus('idle');
    track('research_stop_stream');
  };

  const handleClear = () => {
    clearMessages();
    clearTimeline();
    assistantStreamRef.current = { message: null, content: '' };
    track('research_clear_chat');
  };

  return (
    <div data-page="research" className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/92 border-b border-[rgba(229,231,235,0.6)] backdrop-blur-xl">
        <div className="container">
          <div className="flex items-center justify-between h-[72px]">
            <Link to="/" className="flex items-center gap-3" onClick={() => track('logo_click')}>
              <img src="/icon.png" alt="联脉" className="w-10 h-10 rounded-xl" />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-bold text-[#111827]">联脉</span>
                <span className="text-xs text-[#6b7280]">ReachFlow</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <>
                  {/* 积分余额 */}
                  <Link
                    to="/pricing"
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                    onClick={() => track('credits_nav_click')}
                  >
                    <Zap size={18} />
                    <span>{isLoadingCredits ? '--' : (credits?.credits ?? 0)} 积分</span>
                  </Link>
                  <Link to="/" className="btn btn-outline" onClick={() => track('research_back_home')}>
                    返回首页
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/sign-in" className="btn btn-outline" onClick={() => track('sign_in_click')}>
                    登录
                  </Link>
                  <Link to="/sign-up" className="btn btn-primary" onClick={() => track('sign_up_click')}>
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[72px] pb-20">
        <div className="container py-12">
          <div className="max-w-[1200px] mx-auto">
            {/* Chat Card */}
            <div className="bg-white/96 rounded-[32px] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.15)] border border-[rgba(229,231,235,0.9)]">
              {/* Chat Header */}
              <header className="flex justify-between gap-6 flex-wrap items-end mb-6">
                <div>
                  <p className="text-sm text-primary font-medium mb-1.5 tracking-wide">AI 背调实验台 · 内测</p>
                  <h1 className="text-[clamp(28px,4vw,40px)] font-bold text-[#111827] leading-tight">
                    一个窗口，完成对外贸买家的 AI 背调
                  </h1>
                </div>
                <div className="flex items-end gap-4">
                  <CustomSelect
                    label="Provider"
                    value={settings.provider}
                    options={PROVIDER_OPTIONS}
                    onChange={(value) => updateSettings({ provider: value as ProviderType })}
                  />
                  <button
                    onClick={() => {
                      setShowAdvanced(true);
                      track('research_toggle_advanced');
                    }}
                    className="h-[42px] border border-dashed border-[rgba(47,111,237,0.4)] bg-[rgba(47,111,237,0.08)] text-primary font-semibold rounded-xl px-4 text-sm hover:bg-[rgba(47,111,237,0.12)] transition-colors flex items-center"
                  >
                    高级设置
                  </button>
                </div>
              </header>

              {/* Chat Layout */}
              <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] gap-6" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
                {/* Chat Main */}
                <div className="flex flex-col min-h-0">
                  {/* Messages */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
                    {messages.map((msg, index) => (
                      <div key={msg.id} className="flex flex-col gap-1.5">
                        <div className="text-xs text-[#6b7280]">
                          {msg.role === 'user' ? '你' : msg.role === 'assistant' ? settings.provider : '系统'}
                        </div>
                        <div
                          className={`rounded-[18px] p-4 leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-[rgba(47,111,237,0.1)] border border-[rgba(47,111,237,0.25)]'
                              : msg.role === 'error'
                              ? 'bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.4)] text-error'
                              : 'bg-white border border-[rgba(229,231,235,0.9)]'
                          }`}
                        >
                          {msg.role === 'assistant' || msg.role === 'system' ? (
                            <div className="prose prose-sm max-w-none">
                              {msg.content ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>
                              ) : null}
                              {/* 只有最后一条正在流式的消息显示 loading */}
                              {msg.isStreaming && index === messages.length - 1 && (
                                <Loader2 size={16} className="inline-block text-primary animate-spin ml-1" />
                              )}
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="pt-4 border-t border-[#e5e7eb] flex-shrink-0">
                    <form onSubmit={handleSubmit}>
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (query.trim() && !isLoading) {
                              handleSubmit(e);
                            }
                          }
                        }}
                        placeholder="例：请评估 ABC Imports（德国慕尼黑）近 12 个月的舆情、核心联系人，以及可能的合规风险。"
                        className="input w-full mb-3 resize-none px-4 py-3 text-[15px] leading-relaxed"
                        style={{ minHeight: '100px', maxHeight: '120px' }}
                        rows={3}
                        disabled={isLoading}
                      />

                      {/* Buttons */}
                      <div className="flex gap-3">
                        {isLoading ? (
                          <button
                            type="button"
                            onClick={handleStop}
                            className="btn bg-error text-white hover:bg-error/90"
                          >
                            <Octagon size={18} className="mr-1" fill="currentColor" />
                            停止
                          </button>
                        ) : (
                          <button type="submit" disabled={!query.trim()} className="btn btn-primary">
                            <Send size={18} className="mr-1" />
                            发送
                          </button>
                        )}
                        <button type="button" onClick={handleClear} className="btn btn-secondary">
                          <Trash2 size={18} className="mr-1" />
                          清空记录
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Sidebar - Timeline */}
                <aside className="pl-6 border-l border-[#e5e7eb] flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                      <h2 className="font-semibold text-[#111827]">研究日志</h2>
                      <p className="text-xs text-[#6b7280] mt-1">实时显示搜索、抓取与工具状态</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        status === 'streaming'
                          ? 'bg-secondary/10 text-secondary'
                          : status === 'error'
                          ? 'bg-error/10 text-error'
                          : status === 'active'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-[#6b7280]/10 text-[#6b7280]'
                      }`}
                    >
                      {status === 'idle' ? '待机' : status === 'active' ? '活跃' : status === 'streaming' ? '流式' : '错误'}
                    </span>
                  </div>

                  <ol className="flex-1 overflow-y-auto space-y-3 min-h-0">
                    {timeline.length === 0 ? (
                      <li className="text-[#6b7280] text-sm text-center py-8">暂无事件</li>
                    ) : (
                      timeline.map((entry) => (
                        <li key={entry.id} className="text-sm bg-[rgba(248,250,252,0.95)] border border-[rgba(229,231,235,0.9)] rounded-xl p-3">
                          <div className="font-medium text-primary mb-1">{entry.title}</div>
                          <div className="text-[#6b7280] text-xs mb-1">{formatTimestamp(entry.timestamp / 1000)}</div>
                          {entry.description && (
                            <p className="text-[#111827] text-xs break-all">{entry.description}</p>
                          )}
                        </li>
                      ))
                    )}
                  </ol>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] py-3">
        <div className="container">
          <p className="text-center text-[#6b7280] text-sm">© {new Date().getFullYear()} 联脉 ReachFlow · 内测版本</p>
        </div>
      </footer>

      {/* Advanced Settings Modal */}
      {showAdvanced && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-[480px] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#111827]">高级设置</h3>
              <button
                onClick={() => setShowAdvanced(false)}
                className="p-2 hover:bg-[#f3f4f6] rounded-lg transition-colors"
              >
                <X size={20} className="text-[#6b7280]" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Provider API Key（可选）</label>
                <input
                  type="password"
                  placeholder="留空使用后端默认配置"
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  className="input w-full"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">模型名称（可选）</label>
                <input
                  type="text"
                  placeholder="例如：gpt-4o-mini"
                  value={settings.model}
                  onChange={(e) => updateSettings({ model: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">OpenAI Base URL（可选）</label>
                <input
                  type="url"
                  placeholder="如需自建代理"
                  value={settings.baseUrl}
                  onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">EXA API Key（可选）</label>
                <input
                  type="password"
                  placeholder="覆盖后端默认 Key"
                  value={settings.exaKey}
                  onChange={(e) => updateSettings({ exaKey: e.target.value })}
                  className="input w-full"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#e5e7eb]">
              <button
                onClick={() => setShowAdvanced(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => setShowAdvanced(false)}
                className="btn btn-primary"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
