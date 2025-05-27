import { useState, useEffect, useRef, useCallback } from 'react';
import { RecognitionState } from '../types';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useSpeechRecognition = (onTranscriptUpdate: (text: string) => void) => {
  const [recognitionState, setRecognitionState] = useState<RecognitionState>({
    isListening: false,
    transcript: '',
    error: null,
  });

  const recognition = useRef<any>(null);
  const finalTranscript = useRef<string>('');

  const initializeRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setRecognitionState(prev => ({
        ...prev,
        error: 'このブラウザは音声認識をサポートしていません',
      }));
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'ja-JP';
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setRecognitionState(prev => ({
        ...prev,
        isListening: true,
        error: null,
      }));
    };

    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = '';
      let currentFinalTranscript = finalTranscript.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          currentFinalTranscript += transcript;
          // Send complete sentences for sentiment analysis
          if (transcript.trim().length > 3) {
            onTranscriptUpdate(transcript.trim());
          }
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscript.current = currentFinalTranscript;
      
      setRecognitionState(prev => ({
        ...prev,
        transcript: currentFinalTranscript + interimTranscript,
      }));
    };

    recognitionInstance.onerror = (event: any) => {
      let errorMessage = '音声認識エラーが発生しました';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'ネットワークエラーです';
          break;
        case 'not-allowed':
          errorMessage = 'マイクアクセスが拒否されました';
          break;
        case 'no-speech':
          errorMessage = '音声が検出されませんでした';
          break;
      }

      setRecognitionState(prev => ({
        ...prev,
        error: errorMessage,
        isListening: false,
      }));
    };

    recognitionInstance.onend = () => {
      setRecognitionState(prev => ({
        ...prev,
        isListening: false,
      }));
    };

    return recognitionInstance;
  }, [onTranscriptUpdate]);

  const startListening = useCallback(() => {
    if (!recognition.current) {
      recognition.current = initializeRecognition();
    }

    if (recognition.current) {
      try {
        finalTranscript.current = '';
        setRecognitionState(prev => ({
          ...prev,
          transcript: '',
          error: null,
        }));
        recognition.current.start();
      } catch (error) {
        setRecognitionState(prev => ({
          ...prev,
          error: '音声認識を開始できませんでした',
        }));
      }
    }
  }, [initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognition.current) {
      recognition.current.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  return {
    recognitionState,
    startListening,
    stopListening,
  };
};