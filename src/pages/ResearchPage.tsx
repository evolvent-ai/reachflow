import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Square, Trash2, ChevronDown, ChevronUp, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useResearchStore } from '@/stores/researchStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { streamResearch } from '@/services/research';
import { PROVIDER_OPTIONS, type SSEEvent, type ProviderType } from '@/types/research';
import { formatTimestamp } from '@/utils/helpers';

// 动态导入 Clerk
let useUser: (() => { user: { fullName: string | null; primaryEmailAddress: { emailAddress: string } | null } | null }) | null = null;
let clerkLoaded = false;

try {
  const clerk = require('@clerk/clerk-react');
  useUser = clerk.useUser;
  clerkLoaded = true;
} catch {
  // Clerk 未加载
}

export default function ResearchPage() {
  const { track } = useAnalytics();
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 获取用户信息（如果 Clerk 已加载）
  const user = clerkLoaded && useUser ? useUser().user : null;
  
  const {
    messages,
    addMessage,
    updateLastMessage,
    clearMessages,
    timeline,
    addTimelineEntry,
    clearTimeline,
    status,
    setStatus,
    settings,
    updateSettings,
  } = useResearchStore();

  useEffect(() => {
    track('page_view', { page: 'research' });
  }, [track]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setIsLoading(true);
    setStatus('active');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    track('research_submit', { provider: settings.provider });

    // Create assistant message placeholder
    addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    });

    // Build payload
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
      
      for await (const event of streamResearch(payload as any, abortControllerRef.current.signal)) {
        handleStreamEvent(event);
      }
    } catch (error) {
      console.error('Stream error:', error);
      addMessage({
        role: 'error',
        content: '连接中断，请稍后重试',
      });
      track('research_error', { provider: settings.provider, reason: String(error) });
    } finally {
      setIsLoading(false);
      setStatus('idle');
      abortControllerRef.current = null;
    }
  };

  const handleStreamEvent = (event: SSEEvent) => {
    switch (event.type) {
      case 'assistant_message':
        updateLastMessage(event.content || '');
        break;
      case 'final':
        updateLastMessage(event.content || '');
        break;
      case 'error':
        addMessage({
          role: 'error',
          content: event.message || '发生错误',
        });
        break;
      case 'search_start':
        addTimelineEntry({
          type: 'search_start',
          title: '开始搜索',
          description: `查询: ${event.query || ''}`,
        });
        break;
      case 'search_results':
        addTimelineEntry({
          type: 'search_results',
          title: '搜索结果',
          description: `找到 ${event.results?.length || 0} 条结果`,
        });
        break;
      case 'open_url_start':
        addTimelineEntry({
          type: 'open_url_start',
          title: '正在抓取',
          description: event.url || '',
        });
        break;
      case 'tool_result':
        addTimelineEntry({
          type: 'tool_result',
          title: '工具输出',
          description: event.tool_name || '',
        });
        break;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStatus('idle');
    track('research_stop_stream');
  };

  const handleClear = () => {
    clearMessages();
    clearTimeline();
    track('research_clear_chat');
  };

  return (
    <div data-page="research" className="page min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-text hover:text-primary transition-colors"
              onClick={() => track('research_back_home')}
            >
              <ArrowLeft size={20} />
              <span>返回首页</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">联</span>
              </div>
              <span className="font-semibold">AI 背调实验台</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                内测
              </span>
            </div>
            <div className="flex items-center gap-3">
              {clerkLoaded && user && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <User size={16} />
                  <span className="hidden sm:inline">{user.fullName || user.primaryEmailAddress?.emailAddress}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Chat Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[32px] shadow-chat overflow-hidden">
                {/* Messages */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-[18px] p-4 ${
                          msg.role === 'user'
                            ? 'bg-primary text-white'
                            : msg.role === 'error'
                            ? 'bg-error/10 text-error'
                            : 'bg-background text-text'
                        }`}
                      >
                        {msg.role === 'system' && (
                          <div className="text-xs text-text-secondary mb-1">联脉 Agent</div>
                        )}
                        {msg.role === 'assistant' && (
                          <div className="text-xs text-text-secondary mb-1">联脉 Agent</div>
                        )}
                        {msg.role === 'user' && (
                          <div className="text-xs text-white/70 mb-1">你</div>
                        )}
                        {msg.role === 'assistant' || msg.role === 'system' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content || (msg.isStreaming ? '▋' : '')}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="输入你想了解的公司、人物或话题..."
                      className="flex-1 input"
                      disabled={isLoading}
                    />
                    {isLoading ? (
                      <button
                        type="button"
                        onClick={handleStop}
                        className="btn bg-error text-white hover:bg-error/90"
                      >
                        <Square size={18} className="mr-1" />
                        停止
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!query.trim()}
                        className="btn btn-primary"
                      >
                        <Send size={18} className="mr-1" />
                        发送
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Settings */}
              <div className="card">
                <h3 className="font-semibold mb-4">设置</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">
                      Provider
                    </label>
                    <select
                      value={settings.provider}
                      onChange={(e) => updateSettings({ provider: e.target.value as ProviderType })}
                      className="input w-full"
                    >
                      {PROVIDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setShowAdvanced(!showAdvanced);
                      track('research_toggle_advanced');
                    }}
                    className="flex items-center text-sm text-text-secondary hover:text-text"
                  >
                    高级设置
                    {showAdvanced ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-3 pt-2">
                      <input
                        type="password"
                        placeholder={`${PROVIDER_OPTIONS.find(o => o.value === settings.provider)?.apiKeyLabel || 'API Key'}`}
                        value={settings.apiKey}
                        onChange={(e) => updateSettings({ apiKey: e.target.value })}
                        className="input w-full"
                        autoComplete="off"
                      />
                      <input
                        type="text"
                        placeholder="模型 (可选)"
                        value={settings.model}
                        onChange={(e) => updateSettings({ model: e.target.value })}
                        className="input w-full"
                      />
                      <input
                        type="text"
                        placeholder="OpenAI Base URL (可选)"
                        value={settings.baseUrl}
                        onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                        className="input w-full"
                      />
                      <input
                        type="password"
                        placeholder="EXA API Key (可选)"
                        value={settings.exaKey}
                        onChange={(e) => updateSettings({ exaKey: e.target.value })}
                        className="input w-full"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">研究日志</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    status === 'streaming' ? 'bg-secondary/10 text-secondary' :
                    status === 'error' ? 'bg-error/10 text-error' :
                    status === 'active' ? 'bg-warning/10 text-warning' :
                    'bg-text-secondary/10 text-text-secondary'
                  }`}>
                    {status === 'idle' ? '待机' : status === 'active' ? '活跃' : status === 'streaming' ? '流式' : '错误'}
                  </span>
                </div>
                
                <div className="text-xs text-text-secondary mb-3">
                  实时显示搜索、抓取与工具状态
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {timeline.length === 0 ? (
                    <p className="text-text-secondary text-sm text-center py-4">暂无事件</p>
                  ) : (
                    timeline.map((entry) => (
                      <div key={entry.id} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary text-xs">
                            {formatTimestamp(entry.timestamp / 1000)}
                          </span>
                          <span className="font-medium">{entry.title}</span>
                        </div>
                        {entry.description && (
                          <p className="text-text-secondary text-xs mt-0.5 truncate">
                            {entry.description}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={handleClear}
                  className="btn btn-outline w-full mt-4 text-sm"
                >
                  <Trash2 size={16} className="mr-1" />
                  清空对话
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-border py-3">
        <div className="container">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <p>© {new Date().getFullYear()} 联脉科技 · 内测版本</p>
            <Link to="/" className="hover:text-primary transition-colors">
              返回首页
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
