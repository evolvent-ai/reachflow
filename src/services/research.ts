import { API_BASE_URL } from './api';
import type { ResearchPayload, SSEEvent } from '@/types/research';

export async function* streamResearch(payload: ResearchPayload, signal?: AbortSignal): AsyncGenerator<SSEEvent> {
  const response = await fetch(`${API_BASE_URL}/research/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify(payload),
    signal,
  });

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
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData: SSEEvent = JSON.parse(line.slice(6));
            eventData.timestamp = eventData.timestamp || Date.now() / 1000;
            yield eventData;
          } catch (e) {
            console.error('Failed to parse SSE event:', line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
