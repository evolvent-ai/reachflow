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
    reader.releaseLock();
  }
}
