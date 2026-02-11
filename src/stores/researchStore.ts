import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  ChatMessage, 
  TimelineEntry, 
  StreamStatus, 
  ResearchSettings
} from '@/types/research';
import { generateId } from '@/utils/helpers';

interface ResearchState {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  finishStreaming: () => void;
  clearMessages: () => void;
  
  timeline: TimelineEntry[];
  addTimelineEntry: (entry: Omit<TimelineEntry, 'id' | 'timestamp'>) => void;
  clearTimeline: () => void;
  
  status: StreamStatus;
  setStatus: (status: StreamStatus) => void;
  
  settings: ResearchSettings;
  updateSettings: (settings: Partial<ResearchSettings>) => void;
  
  isStreaming: boolean;
  setIsStreaming: (isStreaming: boolean) => void;
}

const STORAGE_KEY = 'reachflow_research_chat_history';

const SYSTEM_MESSAGE: ChatMessage = {
  id: 'system',
  role: 'system',
  content: '你好！我是联脉 AI 背调助手。输入你想了解的公司、人物或话题，我将为你进行深度研究。',
  timestamp: Date.now(),
};

export const useResearchStore = create<ResearchState>()(
  persist(
    (set) => ({
      messages: [SYSTEM_MESSAGE],
      addMessage: (message) => set((state) => ({
        messages: [
          ...state.messages,
          {
            ...message,
            id: generateId(),
            timestamp: Date.now(),
          },
        ],
      })),
      updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += content;
        }
        return { messages };
      }),
      finishStreaming: () => set((state) => {
        const messages = [...state.messages];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.isStreaming = false;
        }
        return { messages };
      }),
      clearMessages: () => set({ messages: [SYSTEM_MESSAGE] }),
      
      timeline: [],
      addTimelineEntry: (entry) => set((state) => ({
        timeline: [
          ...state.timeline,
          {
            ...entry,
            id: generateId(),
            timestamp: Date.now(),
          },
        ],
      })),
      clearTimeline: () => set({ timeline: [] }),
      
      status: 'idle',
      setStatus: (status) => set({ status }),
      
      settings: {
        provider: 'openai',
        apiKey: '',
        model: '',
        baseUrl: '',
        exaKey: '',
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      
      isStreaming: false,
      setIsStreaming: (isStreaming) => set({ isStreaming }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ 
        messages: state.messages,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        // 恢复时清除所有消息的 loading 状态
        if (state?.messages) {
          state.messages.forEach((msg: ChatMessage) => {
            if (msg.isStreaming) {
              msg.isStreaming = false;
            }
          });
        }
      },
    }
  )
);
