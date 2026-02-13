export enum ModelType {
  FLASH_LITE = 'gemini-flash-lite-latest',
  GEMINI_3_FLASH = 'gemini-3-flash-preview',
}

export enum InputMode {
  TEXT = 'text',
  URL = 'url',
  FILE = 'file'
}

export interface ContentInput {
  type: InputMode;
  content: string | File | null;
}

export interface AnalysisRequest {
  instruction: string;
  contents: ContentInput[];
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
  contents: ContentInput[];
  fileNames?: string[];
  model: ModelType;
  response: string;
  sources?: GroundingSource[];
  useRag?: boolean;
}

export interface GroundingSource {
  title: string;
  uri: string;
}