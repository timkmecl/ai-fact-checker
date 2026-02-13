export enum ModelType {
  FLASH_LITE = 'gemini-flash-lite-latest',
  GEMINI_3_FLASH = 'gemini-3-flash-preview',
}

export enum InputMode {
  TEXT = 'text',
  URL = 'url',
  FILE = 'file'
}

export interface AnalysisRequest {
  instruction: string;
  inputMode: InputMode;
  textContent?: string;
  url?: string;
  file?: File;
  model: ModelType;
  useRag?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  instruction: string;
  inputMode: InputMode;
  textContent?: string;
  url?: string;
  fileName?: string;
  model: ModelType;
  response: string;
}