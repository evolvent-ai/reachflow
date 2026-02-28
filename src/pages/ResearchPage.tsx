import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  Loader2,
  Octagon,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Search,
  Download,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@clerk/clerk-react';
import { useResearchStore } from '@/stores/researchStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { streamResearch } from '@/services/research';
import { getCreditsBalance } from '@/services/payment.api';
import { getConversations, getSessionStreamEvents } from '@/services/conversations';
import type {
  SSEEvent,
  ThinkingEntry,
  ConversationSession,
} from '@/types/research';
import { router } from '@/router';

// ─── helpers ────────────────────────────────────────────────────────────────

const extractText = (data: any): string => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data.text === 'string') return data.text;
  if (typeof data.content === 'string') return data.content;
  if (Array.isArray(data.content)) {
    return data.content
      .map((p: any) => (typeof p === 'string' ? p : p.text || p.content || ''))
      .join('');
  }
  if (typeof data.result === 'string') return data.result;
  return '';
};

const truncateUrl = (url: string, max = 45): string => {
  if (!url) return '...';
  try {
    const u = new URL(url);
    const s = u.hostname + (u.pathname !== '/' ? u.pathname : '');
    return s.length > max ? s.slice(0, max) + '…' : s;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
};

const formatUsageStats = (data: any): string => {
  if (!data) return '用量统计';
  const parts: string[] = [];
  if (data.llm_calls) parts.push(`${data.llm_calls} 次调用`);
  if (data.input_tokens) parts.push(`输入 ${data.input_tokens} tokens`);
  if (data.output_tokens) parts.push(`输出 ${data.output_tokens} tokens`);
  if (data.duration_seconds != null)
    parts.push(`${Number(data.duration_seconds).toFixed(1)}s`);
  return parts.length ? parts.join(' · ') : '用量统计';
};


const getSessionTitle = (s: ConversationSession): string =>
  s.query_preview || s.preview || s.first_user_message || s.title || s.session_id;

// ─── thinking-entry row ──────────────────────────────────────────────────────

const THINKING_STYLES: Record<
  string,
  { dot: string; bg: string; text: string; border: string }
> = {
  llm_request:      { dot: 'bg-gray-400',   bg: 'bg-gray-50',   text: 'text-gray-600',  border: 'border-gray-200' },
  assistant_message:{ dot: 'bg-blue-400',   bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-100' },
  search_start:     { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-100' },
  search_results:   { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-600',  border: 'border-blue-100' },
  open_url_start:   { dot: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700',border: 'border-purple-100'},
  open_url_result:  { dot: 'bg-purple-400', bg: 'bg-purple-50', text: 'text-purple-600',border: 'border-purple-100'},
  tool_result:      { dot: 'bg-orange-400', bg: 'bg-orange-50', text: 'text-orange-700',border: 'border-orange-100'},
  final:            { dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-100' },
  usage_stats:      { dot: 'bg-gray-300',   bg: 'bg-gray-50',   text: 'text-gray-500',  border: 'border-gray-100' },
  log:              { dot: 'bg-gray-300',   bg: 'bg-gray-50',   text: 'text-gray-400',  border: 'border-gray-100' },
};
const DEFAULT_STYLE = { dot: 'bg-gray-300', bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' };

function ThinkingEntryRow({
  entry,
  isExpanded,
  onToggle,
}: {
  entry: ThinkingEntry;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const style = THINKING_STYLES[entry.type] ?? DEFAULT_STYLE;
  const isAssistant = entry.type === 'assistant_message';
  const isFinal = entry.type === 'final';
  const isSearch = entry.type === 'search_start';

  return (
    <div className={`text-xs rounded-lg overflow-hidden border ${style.bg} ${style.border}`}>
      <div
        className={`flex items-start gap-2 px-3 py-2 ${isAssistant ? 'cursor-pointer select-none' : ''}`}
        onClick={isAssistant ? onToggle : undefined}
      >
        {/* icon / dot */}
        <span className="flex-shrink-0 mt-0.5">
          {isFinal ? (
            <Check size={12} className="text-green-500" />
          ) : isSearch ? (
            <Search size={12} className="text-blue-500" />
          ) : (
            <span className={`block w-2 h-2 rounded-full mt-0.5 ${style.dot}`} />
          )}
        </span>

        {/* label */}
        <span className={`flex-1 leading-relaxed break-all ${style.text}`}>
          {entry.content}
        </span>

        {/* expand toggle for assistant_message */}
        {isAssistant && (
          <span className="flex-shrink-0 mt-0.5">
            {entry.isStreaming ? (
              <Loader2 size={10} className="animate-spin text-blue-400" />
            ) : (
              <ChevronRight
                size={10}
                className={`text-blue-400 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
              />
            )}
          </span>
        )}
      </div>

      {/* expanded detail */}
      {isAssistant && (isExpanded || entry.isStreaming) && entry.detail && (
        <div
          className={`px-3 pb-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words border-t ${style.border} ${style.text} max-h-52 overflow-y-auto`}
        >
          {entry.detail}
        </div>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function ResearchPage() {
  const { track } = useAnalytics();
  const { isLoaded, isSignedIn } = useAuth();

  // store
  const {
    messages,
    addMessage,
    setLastMessageContent,
    finishStreaming,
    clearMessages,
    thinkingEntries,
    addThinkingEntry,
    appendOrAddThinking,
    finishLastThinking,
    clearThinking,
    status,
    setStatus,
    settings,
  } = useResearchStore();

  // payment
  const { credits, setCredits, isLoadingCredits, setIsLoadingCredits } = usePaymentStore();

  // local state
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('research_sidebar_collapsed');
    if (stored !== null) return stored === 'true';
    return window.innerWidth < 768; // collapsed by default on mobile
  });
  const [thinkingCollapsed, setThinkingCollapsed] = useState(() => {
    const stored = localStorage.getItem('research_thinking_collapsed');
    if (stored !== null) return stored === 'true';
    return window.innerWidth < 768; // collapsed by default on mobile
  });
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // thinking expand state
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set());

  // refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSubmittingRef = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const thinkingContainerRef = useRef<HTMLDivElement>(null);

  // ── credits ──────────────────────────────────────────────────────────────

  const loadCredits = useCallback(async () => {
    if (!isLoaded) { setIsLoadingCredits(true); return; }
    if (!isSignedIn) { setCredits(null); setIsLoadingCredits(false); return; }
    setIsLoadingCredits(true);
    try {
      setCredits(await getCreditsBalance());
    } catch {
      setCredits(null);
    } finally {
      setIsLoadingCredits(false);
    }
  }, [isLoaded, isSignedIn, setCredits, setIsLoadingCredits]);

  const refreshCredits = useCallback(async () => {
    if (!isSignedIn) return;
    try { setCredits(await getCreditsBalance()); } catch { /* ignore */ }
  }, [isSignedIn, setCredits]);

  // ── sessions ─────────────────────────────────────────────────────────────

  const fetchSessions = useCallback(async () => {
    if (!isSignedIn) return;
    setIsLoadingSessions(true);
    try {
      const res = await getConversations(1, 50);
      setSessions(res);
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [isSignedIn]);

  // ── effects ───────────────────────────────────────────────────────────────

  useEffect(() => { loadCredits(); }, [loadCredits]);
  useEffect(() => { if (isSignedIn) fetchSessions(); }, [isSignedIn, fetchSessions]);
  useEffect(() => { track('page_view', { page: 'research' }); }, [track]);

  // countdown redirect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { router.navigate('/pricing'); setCountdown(null); return; }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // auto-scroll messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // auto-scroll thinking panel
  useEffect(() => {
    if (thinkingContainerRef.current) {
      thinkingContainerRef.current.scrollTop = thinkingContainerRef.current.scrollHeight;
    }
  }, [thinkingEntries]);

  // ── sidebar ───────────────────────────────────────────────────────────────

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('research_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleThinking = () => {
    setThinkingCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('research_thinking_collapsed', String(next));
      return next;
    });
  };

  const handleLoadSession = async (session: ConversationSession) => {
    if (isLoadingSession) return;
    setActiveSessionId(session.session_id);
    setIsLoadingSession(true);
    clearMessages();
    clearThinking();

    // Add the user query from session metadata
    const userQuery = session.query_preview || session.first_user_message || session.title || '';
    if (userQuery) addMessage({ role: 'user', content: userQuery });
    // Placeholder assistant message — final event will populate it
    addMessage({ role: 'assistant', content: '', isStreaming: false });

    try {
      const events = await getSessionStreamEvents(session.session_id);
      for (const ev of events) {
        if (ev.event_type === 'user_message') continue; // skip system prompt
        handleStreamEvent({ event: ev.event_type, type: ev.event_type as any, data: ev.data });
      }
    } catch (err) {
      console.error('[ResearchPage] Failed to load session events:', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleNewConversation = () => {
    clearMessages();
    clearThinking();
    track('research_clear_chat');
  };

  // ── thinking expand ───────────────────────────────────────────────────────

  const toggleThinkingExpand = (id: string) => {
    setExpandedThinking((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── stream ────────────────────────────────────────────────────────────────

  const handleStreamEvent = useCallback(
    (event: SSEEvent) => {
      const type = event.event || event.type || event.data?.event || 'message';
      const data = event.data ?? event;

      switch (type) {
        case 'llm_request':
          finishLastThinking();
          addThinkingEntry({
            type: 'llm_request',
            content: `分析输入`,
            detail: '',
            isStreaming: false,
          });
          break;

        case 'assistant_message':
          appendOrAddThinking(extractText(data));
          break;

        case 'search_start':
          finishLastThinking();
          addThinkingEntry({
            type: 'search_start',
            content: "执行搜索任务",
            detail: '',
            isStreaming: false,
          });
          break;

        case 'search_results':
          finishLastThinking();
          addThinkingEntry({
            type: 'search_results',
            content: `获取到 ${data?.results?.length ?? data?.count ?? '?'} 条结果`,
            detail: '',
            isStreaming: false,
          });
          break;

        case 'open_url_start':
          finishLastThinking();
          addThinkingEntry({
            type: 'open_url_start',
            content: `打开：${truncateUrl(data?.url || '')}`,
            detail: '',
            isStreaming: false,
          });
          break;

        case 'open_url_result':
          finishLastThinking();
          addThinkingEntry({
            type: 'open_url_result',
            content: '已读取页面内容',
            detail: '',
            isStreaming: false,
          });
          break;

        case 'tool_result':
          finishLastThinking();
          addThinkingEntry({
            type: 'tool_result',
            content: '工具执行完成',
            detail: '',
            isStreaming: false,
          });
          break;

        case 'final': {
          finishLastThinking();
          const finalContent = extractText(data);
          if (finalContent) setLastMessageContent(finalContent);
          addThinkingEntry({
            type: 'final',
            content: '报告已生成',
            detail: '',
            isStreaming: false,
          });
          break;
        }

        case 'usage_stats':
          addThinkingEntry({
            type: 'usage_stats',
            content: formatUsageStats(data),
            detail: '',
            isStreaming: false,
          });
          break;

        case 'log':
          if (data?.message) {
            addThinkingEntry({
              type: 'log',
              content: data.message,
              detail: '',
              isStreaming: false,
            });
          }
          break;

        case 'error':
          if (!data?.isClosing) {
            addMessage({
              role: 'error',
              content: data?.message || data?.detail || '发生错误',
            });
          }
          break;

        case 'close':
        case 'done':
          finishStreaming();
          finishLastThinking();
          setStatus('idle');
          setIsLoading(false);
          refreshCredits();
          fetchSessions();
          break;
      }
    },
    [
      addMessage, addThinkingEntry, appendOrAddThinking,
      finishLastThinking, finishStreaming, setLastMessageContent,
      setStatus, refreshCredits, fetchSessions,
    ],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading || isSubmittingRef.current) return;
    if (!isSignedIn) { router.navigate('/sign-in'); return; }

    isSubmittingRef.current = true;
    const balance = await getCreditsBalance();
    if (balance.credits <= 0) {
      isSubmittingRef.current = false;
      setCountdown(3);
      return;
    }

    const userMessage = query.trim();
    setQuery('');
    setIsLoading(true);
    setStatus('active');
    clearThinking();

    addMessage({ role: 'user', content: userMessage });
    // placeholder — only shows spinner until final arrives
    addMessage({ role: 'assistant', content: '', isStreaming: true });

    track('research_submit', { provider: settings.provider });

    const payload: Record<string, any> = { query: userMessage, provider: settings.provider };
    if (settings.model) payload.model = settings.model;
    if (settings.baseUrl) payload.openai_base_url = settings.baseUrl;
    if (settings.exaKey) payload.exa_api_key = settings.exaKey;
    if (settings.apiKey) payload[`${settings.provider}_api_key`] = settings.apiKey;

    try {
      abortControllerRef.current = new AbortController();
      for await (const event of streamResearch(payload as any, abortControllerRef.current.signal)) {
        handleStreamEvent(event);
      }
    } catch (err) {
      console.log('[ResearchPage] Stream ended:', err);
    } finally {
      finishStreaming();
      finishLastThinking();
      setIsLoading(false);
      setStatus('idle');
      abortControllerRef.current = null;
      isSubmittingRef.current = false;
    }
  };

  const handleDownloadPDF = (msgId: string) => {
    const el = document.getElementById(`md-${msgId}`);
    const html = el?.innerHTML ?? '';

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <title>AI 研究报告</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
      font-size: 15px;
      line-height: 1.8;
      color: #1a1a1a;
      padding: 40px 48px;
      max-width: 860px;
      margin: 0 auto;
    }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    h1 { font-size: 24px; font-weight: 700; margin-top: 36px; margin-bottom: 12px; color: #111; }
    h2 { font-size: 20px; font-weight: 700; margin-top: 28px; margin-bottom: 10px; color: #111; }
    h3 { font-size: 16px; font-weight: 700; margin-top: 20px; margin-bottom: 8px; color: #111; }
    p { font-size: 15px; color: #333; margin: 8px 0; }
    ul { padding-left: 24px; margin: 8px 0 16px 0; list-style-type: disc; }
    ol { padding-left: 24px; margin: 8px 0 16px 0; list-style-type: decimal; }
    ul li, ol li { font-size: 15px; color: #333; line-height: 1.9; margin-bottom: 4px; }
    code { font-family: "Menlo", "Consolas", monospace; font-size: 13px; color: #c0392b; background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 1px 5px; }
    pre { background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 12px 0; }
    pre code { color: #1a1a1a; background: none; border: none; padding: 0; font-size: 13px; }
    strong, b { font-weight: 700; color: #111; }
    a { color: #2f6fed; text-decoration: underline; text-underline-offset: 2px; }
    blockquote { border-left: 3px solid #e5e7eb; padding-left: 16px; margin: 12px 0; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
    th { background: #f8fafc; font-weight: 600; text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb; color: #374151; }
    td { padding: 8px 12px; border: 1px solid #e5e7eb; color: #374151; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${html}
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`);
    win.document.close();
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    finishStreaming();
    finishLastThinking();
    setIsLoading(false);
    setStatus('idle');
    track('research_stop_stream');
  };

  // ── derived ───────────────────────────────────────────────────────────────

  const statusLabel: Record<string, string> = {
    idle: '待机', active: '活跃', streaming: '流式', error: '错误',
  };
  const statusColor: Record<string, string> = {
    idle: 'bg-gray-100 text-gray-500',
    active: 'bg-amber-100 text-amber-600',
    streaming: 'bg-blue-100 text-blue-600',
    error: 'bg-red-100 text-red-500',
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div data-page="research" className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* ── countdown modal ── */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center">
            <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">积分不足</h3>
            <p className="text-gray-600 mb-6">您的积分余额不足，请充值后继续使用</p>
            <div className="text-5xl font-bold text-primary mb-4">{countdown}</div>
            <p className="text-sm text-gray-500 mb-4">{countdown} 秒后自动跳转到充值页面</p>
            <Link
              to="/pricing"
              className="btn btn-primary w-full justify-center"
              onClick={() => setCountdown(null)}
            >
              立即充值
            </Link>
          </div>
        </div>
      )}

      {/* ── header ── */}
      <header className="flex-shrink-0 h-[72px] bg-white border-b border-[#e5e7eb] z-50">
        <div className="flex items-center justify-between h-full px-6">
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
                <Link
                  to="/pricing"
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                  onClick={() => track('credits_nav_click')}
                >
                  <Zap size={16} />
                  <span>{isLoadingCredits ? '--' : (credits?.credits ?? 0)} 积分</span>
                </Link>
                <Link to="/" className="btn btn-outline" onClick={() => track('research_back_home')}>
                  返回首页
                </Link>
              </>
            ) : (
              <>
                <Link to="/sign-in" className="btn btn-outline" onClick={() => track('sign_in_click')}>登录</Link>
                <Link to="/sign-up" className="btn btn-primary" onClick={() => track('sign_up_click')}>注册</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── three-panel body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── left: session sidebar ── */}
        <div
          style={{ width: sidebarCollapsed ? '40px' : '240px' }}
          className="transition-[width] duration-200 ease-in-out overflow-hidden flex-shrink-0 border-r border-[#e5e7eb] flex flex-col bg-[#f8fafc]"
        >
          {/* sidebar header */}
          <div className="flex items-center h-12 px-2 border-b border-[#e5e7eb] flex-shrink-0 gap-1">
            {!sidebarCollapsed && (
              <span className="flex-1 text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider px-1">
                对话历史
              </span>
            )}
            <button
              onClick={handleToggleSidebar}
              className="p-1.5 hover:bg-[#e5e7eb] rounded-md transition-colors text-[#6b7280] flex-shrink-0"
              title={sidebarCollapsed ? '展开侧栏' : '折叠侧栏'}
            >
              {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
          </div>

          {!sidebarCollapsed && (
            <>
              {/* new conversation */}
              <div className="px-2 pt-2 pb-1 flex-shrink-0">
                <button
                  onClick={handleNewConversation}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#6b7280] rounded-lg hover:bg-white/70 transition-colors"
                >
                  <Plus size={14} />
                  新对话
                </button>
              </div>

              {/* sessions list */}
              <div className="flex-1 overflow-y-auto py-1">
                {isLoadingSessions ? (
                  <div className="flex justify-center py-6">
                    <Loader2 size={15} className="animate-spin text-[#9ca3af]" />
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-[12px] text-[#9ca3af] text-center py-8 px-3">暂无历史对话</p>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.session_id}
                      onClick={() => handleLoadSession(session)}
                      className={`w-full text-left mx-2 px-4 py-3 rounded-lg transition-colors duration-150 ${
                        activeSessionId === session.session_id
                          ? 'bg-white shadow-sm'
                          : 'hover:bg-white/70'
                      }`}
                      style={{ width: 'calc(100% - 16px)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-normal text-[#1a1a1a] truncate leading-snug tracking-[-0.1px]">
                          {getSessionTitle(session)}
                        </span>
                        {isLoadingSession && activeSessionId === session.session_id && (
                          <Loader2 size={11} className="animate-spin text-[#9ca3af] flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* ── middle: chat area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
          {messages.length === 0 ? (
            /* ── empty state: input vertically centered ── */
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-0">
              <div className="w-full max-w-[760px]">
                <div className="text-center mb-8">
                  <p className="text-sm text-primary font-medium mb-2">AI 背调实验台 · 内测</p>
                  <h2 className="text-2xl font-bold text-[#111827] mb-3">
                    一个窗口，完成对外贸买家的 AI 背调
                  </h2>
                  <p className="text-sm text-[#6b7280] max-w-md mx-auto">
                    输入目标公司名称或联系人，AI 将完成尽职调查并输出报告
                  </p>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (query.trim() && !isLoading) handleSubmit(e);
                        }
                      }}
                      placeholder="例：请评估 ABC Imports（德国慕尼黑）近 12 个月的舆情、核心联系人，以及可能的合规风险。"
                      className="input w-full resize-none px-4 py-3 pb-12 text-[15px] leading-relaxed"
                      style={{ minHeight: '100px', maxHeight: '160px' }}
                      rows={3}
                      disabled={isLoading}
                    />
                    {!isLoading && query.trim() && (
                      <button
                        type="submit"
                        className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* ── active chat: messages + input pinned at bottom ── */
            <>
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto min-h-0 px-4 py-5"
              >
                <div className="max-w-[760px] mx-auto w-full space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-xs text-[#9ca3af]">
                        {msg.role === 'user' ? '你' : msg.role === 'assistant' ? 'AI 助手' : '系统'}
                      </div>
                      <div
                        className={`relative rounded-[18px] p-4 leading-relaxed ${
                          msg.role === 'user'
                            ? 'max-w-[75%] bg-[rgba(47,111,237,0.08)] border border-[rgba(47,111,237,0.2)]'
                            : msg.role === 'error'
                            ? 'w-full bg-red-50 border border-red-200 text-red-600'
                            : 'w-full bg-white border border-[#e5e7eb]'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <>
                            {!msg.isStreaming && msg.content && (
                              <button
                                onClick={() => handleDownloadPDF(msg.id)}
                                className="absolute right-3 top-3 ml-3 p-1.5 text-[#c8cdd5] hover:text-[#6b7280] transition-colors rounded"
                                title="下载报告"
                              >
                                <Download size={15} />
                              </button>
                            )}
                            <div className="md-content" id={`md-${msg.id}`}>
                              {msg.content ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                              ) : null}
                              {msg.isStreaming && index === messages.length - 1 && !msg.content && (
                                <div className="flex items-center gap-2 text-[#6b7280]">
                                  <Loader2 size={15} className="animate-spin text-primary" />
                                  <span className="text-sm">正在生成报告...</span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-shrink-0 px-4 py-4">
                <div className="max-w-[760px] mx-auto w-full">
                  <form onSubmit={handleSubmit}>
                    <div className="relative">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (query.trim() && !isLoading) handleSubmit(e);
                          }
                        }}
                        placeholder="例：请评估 ABC Imports（德国慕尼黑）近 12 个月的舆情、核心联系人，以及可能的合规风险。"
                        className="input w-full resize-none px-4 py-3 pb-12 text-[15px] leading-relaxed"
                        style={{ minHeight: '100px', maxHeight: '160px' }}
                        rows={3}
                        disabled={isLoading}
                      />
                      {isLoading && (
                        <button
                          type="button"
                          onClick={handleStop}
                          className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 bg-error text-white text-sm font-medium rounded-lg hover:bg-error/90 transition-colors"
                        >
                          <Octagon size={14} fill="currentColor" />
                          停止
                        </button>
                      )}
                      {!isLoading && query.trim() && (
                        <button
                          type="submit"
                          className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── right: thinking chain ── */}
        <aside
          style={{ width: thinkingCollapsed ? '40px' : '300px' }}
          className="transition-[width] duration-200 ease-in-out flex-shrink-0 border-l border-[#e5e7eb] flex flex-col overflow-hidden bg-[#f8fafc]"
        >
          {/* panel header */}
          <div className="flex-shrink-0 flex items-center h-12 px-2 border-b border-[#e5e7eb] gap-1">
            <button
              onClick={handleToggleThinking}
              className="p-1.5 hover:bg-[#e5e7eb] rounded-md transition-colors text-[#6b7280] flex-shrink-0"
              title={thinkingCollapsed ? '展开思考面板' : '折叠思考面板'}
            >
              {thinkingCollapsed ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
            </button>
            {!thinkingCollapsed && (
              <>
                <span className="flex-1 text-sm font-semibold text-[#111827]">思考过程</span>
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${statusColor[status] ?? statusColor.idle}`}
                >
                  {statusLabel[status] ?? '待机'}
                </span>
              </>
            )}
          </div>

          {/* entries */}
          {!thinkingCollapsed && (
            <div ref={thinkingContainerRef} className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-0">
              {thinkingEntries.length === 0 ? (
                <p className="text-[11px] text-[#9ca3af] text-center py-10">等待开始...</p>
              ) : (
                thinkingEntries.map((entry) => (
                  <ThinkingEntryRow
                    key={entry.id}
                    entry={entry}
                    isExpanded={expandedThinking.has(entry.id)}
                    onToggle={() => toggleThinkingExpand(entry.id)}
                  />
                ))
              )}
              {/* loading indicator at bottom while streaming */}
              {isLoading && (
                <div className="flex items-center gap-2 px-3 py-2 mt-1">
                  <Loader2 size={13} className="animate-spin text-primary flex-shrink-0" />
                  <span className="text-[11px] text-[#9ca3af]">处理中...</span>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

    </div>
  );
}
