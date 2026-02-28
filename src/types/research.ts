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
  | 'close'
  | 'task_created'
  | 'log'
  | 'user_message'
  | 'llm_request'
  | 'llm_response'
  | 'usage_stats';

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

export interface ThinkingEntry {
  id: string;
  type: EventType;
  /** Short display label shown in collapsed state */
  content: string;
  /** Full text content, used for expandable assistant_message entries */
  detail: string;
  timestamp: number;
  isStreaming: boolean;
  /** Cumulative elapsed ms from task start, if available */
  elapsed_ms?: number;
}

export interface ConversationSession {
  session_id: string;
  created_at: number | string; // unix timestamp (seconds) or ISO string
  updated_at?: number | string;
  query_preview?: string;
  preview?: string;
  first_user_message?: string;
  title?: string;
  message_count?: number;
  transaction_uid?: string;
  transaction_no?: string;
}

export interface ApiContentBlock {
  type: 'text' | 'tool_call';
  text?: string;
  tool_name?: string;
  tool_input?: Record<string, any>;
  tool_id?: string;
}

export interface ApiMessage {
  uid: string;
  seq: number;
  role: 'user' | 'assistant' | 'assistant_tool_call' | 'tool';
  content: ApiContentBlock[];
}

/** @deprecated use ApiMessage instead */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
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
