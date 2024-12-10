// src/types/index.ts
export interface MessageContent {
  type: string;
  text: {
      value: string;
      annotations?: any[];
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | MessageContent | MessageContent[];
  file_ids?: string[];
  thread_id?: string;
  created_at?: number;
  metadata?: Record<string, any>;
}

export interface ThreadResponse {
  id: string;
  object: string;
  created_at: number;
  metadata?: Record<string, any>;
}

export interface RunResponse {
  id: string;
  object: string;
  created_at: number;
  assistant_id: string;
  thread_id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  started_at?: number;
  completed_at?: number;
  model?: string;
  metadata?: Record<string, any>;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
}

export interface FileResponse extends FileUpload {
  object: string;
  created_at: number;
  purpose: string;
}

export interface APIResponse<T> {
  object: string;
  data: T[];
  first_id?: string;
  last_id?: string;
  has_more: boolean;
}

export interface APIError {
  message: string;
  type: string;
  code: string;
  param?: string;
}

// Neue MarkdownMessage Types
export interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}