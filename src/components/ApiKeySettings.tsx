import React, { useState, useEffect } from 'react';

interface ApiKeySettingsProps {
  onApiKeyChange?: (apiKey: string) => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem('huggingface_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange?.(savedApiKey);
    }
  }, [onApiKeyChange]);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setSaveStatus('saving');
    
    // Save to localStorage
    if (value.trim()) {
      localStorage.setItem('huggingface_api_key', value.trim());
    } else {
      localStorage.removeItem('huggingface_api_key');
    }
    
    // Notify parent component
    onApiKeyChange?.(value.trim());
    
    // Show save status
    setTimeout(() => setSaveStatus('saved'), 300);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('huggingface_api_key');
    onApiKeyChange?.('');
    setSaveStatus(null);
  };

  const getApiKeyStatus = () => {
    if (!apiKey.trim()) {
      return {
        status: 'フォールバック分析を使用中',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    }
    return {
      status: 'HuggingFace API使用中',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  };

  const statusInfo = getApiKeyStatus();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">🔑</span>
          API設定
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {/* API Status */}
      <div className={`p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} mb-4`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.status}
          </span>
          {saveStatus && (
            <span className="text-xs text-gray-500">
              {saveStatus === 'saving' ? '保存中...' : '保存済み'}
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div>
            <label htmlFor="huggingface-api-key" className="block text-sm font-medium text-gray-700 mb-2">
              HuggingFace APIキー
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  id="huggingface-api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              {apiKey && (
                <button
                  onClick={clearApiKey}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  クリア
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <p>
              <strong>HuggingFace APIキーについて:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <a 
                  href="https://huggingface.co/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  HuggingFace
                </a>
                でアカウントを作成し、APIキーを取得してください
              </li>
              <li>APIキーは「hf_」で始まります</li>
              <li>APIキーを設定すると、より高精度な感情分析が利用できます</li>
              <li>APIキーなしでも基本的なキーワードベース分析は動作します</li>
              <li>APIキーはブラウザのローカルストレージに安全に保存されます</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};