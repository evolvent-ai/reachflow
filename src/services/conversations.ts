import { API_BASE_URL } from './api';
import type { ConversationSession, ApiMessage } from '@/types/research';

async function getClerkToken(): Promise<string | null> {
  try {
    const clerk = (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk;
    if (clerk?.session) {
      return await clerk.session.getToken();
    }
    return null;
  } catch {
    return null;
  }
}

async function authRequest<T>(url: string): Promise<T> {
  const token = await getClerkToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any).detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * GET /api/v1/client/conversations — 分页查 session 列表
 * 后端直接返回数组
 */
export async function getConversations(page = 1, size = 50): Promise<ConversationSession[]> {
  const res = await authRequest<ConversationSession[] | { items: ConversationSession[] }>(
    `/v1/client/conversations?page=${page}&size=${size}`,
  );
  return Array.isArray(res) ? res : (res.items ?? []);
}

/**
 * GET /api/v1/client/conversations/{session_id} — 查单个 session 所有消息
 * 后端直接返回 ApiMessage 数组
 */
export async function getConversationMessages(sessionId: string): Promise<ApiMessage[]> {
  const res = await authRequest<ApiMessage[] | { messages: ApiMessage[] }>(
    `/v1/client/conversations/${sessionId}`,
  );
  return Array.isArray(res) ? res : (res.messages ?? []);
}
