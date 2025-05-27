import { useState, useEffect, useRef, useCallback } from 'react';
import { AudioState } from '../types';
import { AudioProcessor } from '../utils/audioProcessor';

export const useAudioRecording = () => {
  const [audioState, setAudioState] = useState<AudioState>({
    isRecording: false,
    duration: 0,
    audioLevel: 0,
    error: null,
  });

  const mediaStream = useRef<MediaStream | null>(null);
  const audioProcessor = useRef<AudioProcessor | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  const updateAudioLevel = useCallback(() => {
    if (audioProcessor.current && audioState.isRecording) {
      const level = audioProcessor.current.getAudioLevel();
      setAudioState(prev => ({ ...prev, audioLevel: level }));
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [audioState.isRecording]);

  const startRecording = useCallback(async () => {
    try {
      setAudioState(prev => ({ ...prev, error: null }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      mediaStream.current = stream;
      audioProcessor.current = new AudioProcessor();
      await audioProcessor.current.initialize(stream);

      setAudioState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
      }));

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setAudioState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

      // Start audio level monitoring
      updateAudioLevel();
    } catch (error) {
      setAudioState(prev => ({
        ...prev,
        error: 'マイクアクセスが許可されていません',
      }));
    }
  }, [updateAudioLevel]);

  const stopRecording = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }

    if (audioProcessor.current) {
      audioProcessor.current.cleanup();
      audioProcessor.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setAudioState(prev => ({
      ...prev,
      isRecording: false,
      audioLevel: 0,
    }));
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    audioState,
    startRecording,
    stopRecording,
  };
};