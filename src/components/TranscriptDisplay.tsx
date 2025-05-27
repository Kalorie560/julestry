import React from 'react';
import { SentimentResult } from '../types';

interface TranscriptDisplayProps {
  sentimentResults: SentimentResult[];
  currentTranscript: string;
  isListening: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  sentimentResults,
  currentTranscript,
  isListening,
}) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '😊';
      case 'negative':
        return '😟';
      default:
        return '😐';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        音声認識・感情分析結果
      </h3>
      
      {/* Current transcript (live) */}
      {isListening && currentTranscript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600 font-medium">認識中...</span>
          </div>
          <p className="text-gray-700">{currentTranscript}</p>
        </div>
      )}

      {/* Analysis results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sentimentResults.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">🎤</div>
            <p>音声を認識すると、ここに文字起こしと感情分析結果が表示されます</p>
          </div>
        ) : (
          sentimentResults
            .slice()
            .reverse()
            .map((result, index) => (
              <div
                key={`${result.timestamp}-${index}`}
                className={`p-4 rounded-lg border ${getSentimentColor(result.sentiment)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">
                      {getSentimentIcon(result.sentiment)} {result.text}
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="capitalize font-medium">
                        {result.sentiment === 'positive' && 'ポジティブ'}
                        {result.sentiment === 'negative' && 'ネガティブ'}
                        {result.sentiment === 'neutral' && 'ニュートラル'}
                      </span>
                      <span className="text-gray-500">
                        信頼度: {Math.round(result.confidence * 100)}%
                      </span>
                      <span className="text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};