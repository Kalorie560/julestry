import React, { useCallback, useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RecordingButton } from './components/RecordingButton';
import { AudioLevelMeter } from './components/AudioLevelMeter';
import { SentimentChart } from './components/SentimentChart';
import { TranscriptDisplay } from './components/TranscriptDisplay';
import { useAudioRecording } from './hooks/useAudioRecording';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSentimentAnalysis } from './hooks/useSentimentAnalysis';

function App() {
  const { audioState, startRecording, stopRecording } = useAudioRecording();
  const { sentimentStats, sentimentResults, analyzeText, resetAnalysis, getPercentages } = useSentimentAnalysis();
  
  const handleTranscriptUpdate = useCallback((text: string) => {
    analyzeText(text).catch(error => {
      console.error('Failed to analyze text:', error);
    });
  }, [analyzeText]);
  
  const { recognitionState, startListening, stopListening } = useSpeechRecognition(handleTranscriptUpdate);

  const handleStartRecording = useCallback(async () => {
    resetAnalysis();
    await startRecording();
    startListening();
  }, [startRecording, startListening, resetAnalysis]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    stopListening();
  }, [stopRecording, stopListening]);

  // Display browser compatibility warning
  const isCompatible = () => {
    return (
      'getUserMedia' in navigator.mediaDevices &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  };

  const percentages = getPercentages();

  if (!isCompatible()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ブラウザ非対応
            </h2>
            <p className="text-gray-600 mb-4">
              このアプリはWeb Audio APIとWeb Speech APIを使用します。
              Chrome、Safari、またはFirefoxの最新版をご利用ください。
            </p>
            <p className="text-sm text-gray-500">
              ※ HTTPSが必要です
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              録音データ感情判定アプリ
            </h1>
            <p className="text-gray-600">
              リアルタイム音声認識・感情分析システム
            </p>
          </header>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Recording Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center space-y-6">
                <RecordingButton
                  audioState={audioState}
                  onStartRecording={handleStartRecording}
                  onStopRecording={handleStopRecording}
                />
                
                <AudioLevelMeter
                  level={audioState.audioLevel}
                  isRecording={audioState.isRecording}
                />
              </div>
            </div>

            {/* Recognition Status */}
            {(recognitionState.isListening || recognitionState.error) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-center">
                  {recognitionState.isListening && (
                    <div className="flex items-center justify-center space-x-2 text-green-600">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">音声認識中...</span>
                    </div>
                  )}
                  
                  {recognitionState.error && (
                    <div className="text-red-500 text-sm">
                      {recognitionState.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sentiment Analysis Results */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <SentimentChart
                stats={sentimentStats}
                percentages={percentages}
              />
            </div>

            {/* Transcript Display */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <TranscriptDisplay
                sentimentResults={sentimentResults}
                currentTranscript={recognitionState.transcript}
                isListening={recognitionState.isListening}
              />
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">使用方法</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📱 基本操作</h4>
                  <ul className="space-y-1">
                    <li>• 緑のボタンで録音開始</li>
                    <li>• 赤のボタンで録音停止</li>
                    <li>• マイクアクセスを許可してください</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🎯 感情判定</h4>
                  <ul className="space-y-1">
                    <li>• リアルタイムで感情を分析</li>
                    <li>• ポジティブ・ネガティブ・ニュートラル</li>
                    <li>• 日本語音声に対応</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>注意:</strong> 本アプリはHTTPS環境でのみ動作します。
                  音声データは保存されません。
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>&copy; 2024 録音データ感情判定アプリ</p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;