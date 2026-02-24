import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ChatMessage,
  ThinkingEntry,
  StreamStatus,
  ResearchSettings,
} from '@/types/research';
import { generateId } from '@/utils/helpers';

interface ResearchState {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  /** Replace (not append) the last assistant message's content */
  setLastMessageContent: (content: string) => void;
  finishStreaming: () => void;
  clearMessages: () => void;

  thinkingEntries: ThinkingEntry[];
  addThinkingEntry: (entry: Omit<ThinkingEntry, 'id' | 'timestamp'>) => void;
  /** Append text to last thinking entry if it's a streaming assistant_message,
   *  otherwise create a new assistant_message thinking entry */
  appendOrAddThinking: (chunk: string) => void;
  /** Mark the last thinking entry as done streaming, update content to first 60 chars of detail */
  finishLastThinking: () => void;
  clearThinking: () => void;

  status: StreamStatus;
  setStatus: (status: StreamStatus) => void;

  settings: ResearchSettings;
  updateSettings: (settings: Partial<ResearchSettings>) => void;
}

const STORAGE_KEY = 'reachflow_research_chat_history';

export const useResearchStore = create<ResearchState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...message, id: generateId(), timestamp: Date.now() },
          ],
        })),
      setLastMessageContent: (content) =>
        set((state) => {
          const messages = [...state.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === 'assistant') {
            messages[lastIdx] = { ...messages[lastIdx], content };
          }
          return { messages };
        }),
      finishStreaming: () =>
        set((state) => ({
          messages: state.messages.map((msg, index) =>
            index === state.messages.length - 1 && msg.role === 'assistant'
              ? { ...msg, isStreaming: false }
              : msg,
          ),
        })),
      clearMessages: () => set({ messages: [] }),

      thinkingEntries: [],
      addThinkingEntry: (entry) =>
        set((state) => ({
          thinkingEntries: [
            ...state.thinkingEntries,
            { ...entry, id: generateId(), timestamp: Date.now() },
          ],
        })),
      appendOrAddThinking: (chunk) =>
        set((state) => {
          const entries = [...state.thinkingEntries];
          const last = entries[entries.length - 1];
          if (last && last.type === 'assistant_message' && last.isStreaming) {
            entries[entries.length - 1] = {
              ...last,
              detail: last.detail + chunk,
            };
            return { thinkingEntries: entries };
          }
          // No open streaming entry — create a new one
          return {
            thinkingEntries: [
              ...state.thinkingEntries,
              {
                id: generateId(),
                type: 'assistant_message',
                content: '正在推理...',
                detail: chunk,
                timestamp: Date.now(),
                isStreaming: true,
              },
            ],
          };
        }),
      finishLastThinking: () =>
        set((state) => {
          const entries = [...state.thinkingEntries];
          const lastIdx = entries.length - 1;
          if (lastIdx < 0 || !entries[lastIdx].isStreaming) return state;
          const last = entries[lastIdx];
          const preview =
            last.detail.slice(0, 60) + (last.detail.length > 60 ? '...' : '');
          entries[lastIdx] = {
            ...last,
            isStreaming: false,
            content: preview || '推理完成',
          };
          return { thinkingEntries: entries };
        }),
      clearThinking: () => set({ thinkingEntries: [] }),

      status: 'idle',
      setStatus: (status) => set({ status }),

      settings: {
        provider: 'openai',
        apiKey: '',
        model: '',
        baseUrl: '',
        exaKey: '',
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        messages: state.messages,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.messages) {
          state.messages.forEach((msg: ChatMessage) => {
            if (msg.isStreaming) msg.isStreaming = false;
          });
        }
      },
    },
  ),
);
