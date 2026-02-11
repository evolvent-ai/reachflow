// Research page types

export type ProviderType = 'openai' | 'anthropic' | 'gemini';

export type StreamStatus = 'idle' | 'active' | 'streaming' | 'error';

export type EventType = 
  | 'search_start'
  | 'search_results'
  | 'open_url_start'
  | 'open_url_result'
  | 'tool_result'
  | 'assistant_message'
  | 'final'
  | 'error'
  | 'ping'
  | 'done'
  | 'close';

export interface SSEEvent {
  type?: EventType;
  event?: string;
  timestamp?: number;
  data?: any;
  [key: string]: any;
}

export interface SearchResult {
  title: string;
  link: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'error';
  content: string;
  isStreaming?: boolean;
  timestamp: number;
}

export interface TimelineEntry {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  html?: string;
  timestamp: number;
}

export interface ResearchSettings {
  provider: ProviderType;
  apiKey: string;
  model: string;
  baseUrl: string;
  exaKey: string;
}

export interface ResearchPayload {
  query: string;
  provider: ProviderType;
  model?: string;
  openai_base_url?: string;
  exa_api_key?: string;
  openai_api_key?: string;
  anthropic_api_key?: string;
  gemini_api_key?: string;
}

export interface ProviderOption {
  value: ProviderType;
  label: string;
  apiKeyLabel: string;
}

export const PROVIDER_OPTIONS: ProviderOption[] = [
  { value: 'openai', label: 'OpenAI', apiKeyLabel: 'OpenAI API Key' },
  { value: 'anthropic', label: 'Anthropic', apiKeyLabel: 'Anthropic API Key' },
  { value: 'gemini', label: 'Gemini', apiKeyLabel: 'Gemini API Key' },
];
