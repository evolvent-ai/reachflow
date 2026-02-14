import { API_BASE_URL } from './api';
import type { ResearchPayload, SSEEvent } from '@/types/research';

const AUTH_ERROR_MESSAGE = 'Authentication failed: AuthErrorReason.SESSION_TOKEN_MISSING';

/**
 * 获取 Clerk JWT Token
 */
async function getClerkToken(): Promise<string | null> {
  try {
    // 从 window.Clerk 获取 token（避免在普通函数中使用 React Hook）
    const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
    return null;
  } catch {
    return null;
  }
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

export async function* streamResearch(payload: ResearchPayload, signal?: AbortSignal): AsyncGenerator<SSEEvent> {
  const token = await getClerkToken();

  // 没有 token 说明用户未登录，直接抛出错误，不发请求
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/research/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    signal,
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
      console.warn('[Research] Session token missing, redirecting to login...');
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

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      
      // SSE 消息以 \n\n 分隔
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        
        if (chunk.trim()) {
          // 解析 SSE 格式：event: xxx\ndata: xxx
          const lines = chunk.split('\n');
          let eventType = 'message';
          let dataStr = '';
          
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr += line.slice(5).trim();
            }
          }
          
          if (dataStr) {
            try {
              const eventData: SSEEvent = JSON.parse(dataStr);
              // 保存原始 event 类型（从 event: xxx 行获取）
              eventData.event = eventType;
              eventData.timestamp = eventData.timestamp || Date.now() / 1000;
              yield eventData;
            } catch (e) {
              console.error('Failed to parse SSE event:', dataStr, e);
            }
          }
        }
      }
    }
    
    // 处理剩余的数据
    if (buffer.trim()) {
      const lines = buffer.split('\n');
      let eventType = 'message';
      let dataStr = '';
      
      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataStr += line.slice(5).trim();
        }
      }
      
      if (dataStr) {
        try {
          const eventData: SSEEvent = JSON.parse(dataStr);
          eventData.event = eventType;
          eventData.timestamp = eventData.timestamp || Date.now() / 1000;
          yield eventData;
        } catch (e) {
          console.error('Failed to parse SSE event:', dataStr, e);
        }
      }
    }
  } finally {
    // 安全地释放 reader
    try {
      reader.releaseLock();
    } catch (e) {
      // 忽略释放锁时的错误
    }
  }
}
