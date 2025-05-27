export interface SentimentResult {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: number;
}

export interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

export interface AudioState {
  isRecording: boolean;
  duration: number;
  audioLevel: number;
  error: string | null;
}

export interface RecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

export type SentimentType = 'positive' | 'negative' | 'neutral';