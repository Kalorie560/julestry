import React from 'react';
import { AudioState } from '../types';

interface RecordingButtonProps {
  audioState: AudioState;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const RecordingButton: React.FC<RecordingButtonProps> = ({
  audioState,
  onStartRecording,
  onStopRecording,
}) => {
  const handleClick = () => {
    if (audioState.isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        disabled={!!audioState.error}
        className={`
          relative w-32 h-32 rounded-full border-4 transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${
            audioState.isRecording
              ? 'bg-red-500 border-red-600 text-white hover:bg-red-600 focus:ring-red-300 animate-pulse'
              : 'bg-green-500 border-green-600 text-white hover:bg-green-600 focus:ring-green-300'
          }
        `}
        aria-label={audioState.isRecording ? '録音停止' : '録音開始'}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {audioState.isRecording ? (
            <>
              <div className="w-6 h-6 bg-white rounded-sm mb-2"></div>
              <span className="text-sm font-medium">停止</span>
            </>
          ) : (
            <>
              <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1 mb-2"></div>
              <span className="text-sm font-medium">録音</span>
            </>
          )}
        </div>
      </button>

      {audioState.isRecording && (
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-gray-800">
            {formatTime(audioState.duration)}
          </div>
          <div className="text-sm text-gray-600 mt-1">録音時間</div>
        </div>
      )}

      {audioState.error && (
        <div className="text-red-500 text-sm text-center max-w-xs">
          {audioState.error}
        </div>
      )}
    </div>
  );
};