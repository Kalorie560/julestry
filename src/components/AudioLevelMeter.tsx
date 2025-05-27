import React from 'react';

interface AudioLevelMeterProps {
  level: number;
  isRecording: boolean;
}

export const AudioLevelMeter: React.FC<AudioLevelMeterProps> = ({
  level,
  isRecording,
}) => {
  const normalizedLevel = Math.max(0, Math.min(100, level));
  const barCount = 20;
  const activeBars = Math.round((normalizedLevel / 100) * barCount);

  const getBarColor = (index: number) => {
    const percentage = (index + 1) / barCount;
    
    if (percentage <= 0.6) return 'bg-green-400';
    if (percentage <= 0.8) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">音声レベル</span>
        <span className="text-sm text-gray-600">
          {Math.round(normalizedLevel)}%
        </span>
      </div>
      
      <div className="flex items-center space-x-1 h-8 bg-gray-100 rounded-lg p-2">
        {Array.from({ length: barCount }, (_, index) => (
          <div
            key={index}
            className={`
              flex-1 h-full rounded-sm transition-all duration-75 ease-out
              ${
                isRecording && index < activeBars
                  ? getBarColor(index)
                  : 'bg-gray-300'
              }
            `}
          />
        ))}
      </div>
      
      {!isRecording && (
        <div className="text-xs text-gray-500 text-center mt-2">
          録音を開始すると音声レベルが表示されます
        </div>
      )}
    </div>
  );
};