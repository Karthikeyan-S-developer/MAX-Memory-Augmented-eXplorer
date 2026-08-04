export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface MemoryEntry {
  id: string;
  content: string;
  importance: number;
  createdAt: string;
}

export interface AssistantSettings {
  assistantName: string;
  voice: string;
  wakeWord: string;
  theme: 'dark' | 'light';
  model: string;
}
