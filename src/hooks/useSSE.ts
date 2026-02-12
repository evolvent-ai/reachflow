import { useCallback, useRef, useState } from 'react';
import type { SSEEvent, StreamStatus, ResearchPayload } from '@/types/research';

const AUTH_ERROR_MESSAGE = 'Authentication failed: AuthErrorReason.SESSION_TOKEN_MISSING';

interface UseSSEOptions {
  onEvent?: (event: SSEEvent) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * 处理 401 认证失败，跳转到登录页
 */
function handleAuthError(): void {
  // 保存当前路径，登录后可以跳转回来
  const currentPath = window.location.pathname + window.location.search;
  if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  // 跳转到登录页
  window.location.href = '/sign-in';
}

export function useSSE(baseUrl: string, options: UseSSEOptions = {}) {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  const connect = useCallback(async (payload: ResearchPayload) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setStatus('active');
    setEvents([]);

    try {
      const response = await fetch(`${baseUrl}/research/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current?.signal,
      });

      // 处理 401 认证失败
      if (response.status === 401) {
        let errorData: { detail?: string } = {};
        try {
          errorData = await response.json();
        } catch {
          // 解析失败，使用空对象
        }

        // 检查是否是 session token 缺失的错误
        if (errorData.detail?.includes(AUTH_ERROR_MESSAGE)) {
          console.warn('[SSE] Session token missing, redirecting to login...');
          handleAuthError();
          throw new Error('Authentication required');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      setIsConnected(true);
      setStatus('streaming');
      options.onOpen?.();

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData: SSEEvent = JSON.parse(line.slice(6));
              eventData.timestamp = eventData.timestamp || Date.now() / 1000;
              
              setEvents(prev => [...prev, eventData]);
              options.onEvent?.(eventData);

              if (eventData.type === 'error') {
                setStatus('error');
                options.onError?.(new Error(eventData.message || 'Unknown error'));
              } else if (eventData.type === 'done') {
                setStatus('idle');
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', line);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setStatus('error');
        options.onError?.(error);
      }
    } finally {
      setIsConnected(false);
      if (status !== 'error') {
        setStatus('idle');
      }
      options.onClose?.();
    }
  }, [baseUrl, options, status]);

  const disconnect = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsConnected(false);
    setStatus('idle');
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    isConnected,
    status,
    connect,
    disconnect,
    clearEvents,
  };
}
