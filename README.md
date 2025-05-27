# 録音データ感情判定アプリ

リアルタイム音声認識と感情分析を行うWebアプリケーション。音声を録音して自動的に文字起こしし、HuggingFace DistilBERTモデルを使用してポジティブ/ネガティブ/ニュートラルの感情を分析・可視化します。

## 🎯 主な機能

- **リアルタイム音声録音**: Web Audio APIを使用した高品質な音声録音
- **音声認識**: Web Speech APIによる日本語音声の文字起こし
- **感情分析**: HuggingFace DistilBERTモデル + フォールバック機能による高精度感情判定
- **リアルタイム可視化**: Chart.jsによる円グラフ・棒グラフでの感情比率表示
- **音声レベル表示**: 録音中の音声レベルをリアルタイムで可視化

## 🛠 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **音声処理**: Web Audio API
- **音声認識**: Web Speech API
- **感情分析**: HuggingFace DistilBERT API
- **チャート**: Chart.js + react-chartjs-2
- **状態管理**: React Hooks

## 📦 インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd playground
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで http://localhost:5173 にアクセス

## 🔑 HuggingFace API設定（推奨）

より高精度な感情分析を利用するには、HuggingFace APIキーの設定をお勧めします：

1. [HuggingFace](https://huggingface.co/settings/tokens)でアカウントを作成
2. APIキー（Access Token）を取得
3. アプリケーション上部の「API設定」でAPIキーを入力
4. APIキーは自動的にブラウザのローカルストレージに保存されます

**注意**: APIキーなしでも基本的なキーワードベース分析は動作しますが、精度が劣る場合があります。

## 🔧 ビルド

```bash
# プロダクション用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview

# TypeScript型チェック + ビルド
npm run build
```

## 🚀 使用方法

### 基本操作

1. **録音開始**: 緑色の「録音」ボタンをクリック
2. **マイクアクセス許可**: ブラウザのマイクアクセス許可ダイアログで「許可」を選択
3. **音声入力**: 日本語で話す（文字起こしがリアルタイムで画面に表示されます）
4. **感情分析結果**: リアルタイムで感情比率と分析結果が更新されます
5. **録音停止**: 赤色の「停止」ボタンをクリック

### 感情判定について

- **ポジティブ**: 嬉しい、楽しい、良いなどの肯定的な感情
- **ネガティブ**: 悲しい、辛い、悪いなどの否定的な感情  
- **ニュートラル**: 中性的または感情的でない内容

## 📁 プロジェクト構造

```
src/
├── components/
│   ├── RecordingButton.tsx      # 録音開始/停止ボタン
│   ├── AudioLevelMeter.tsx      # 音声レベルメーター
│   ├── SentimentChart.tsx       # 感情分析チャート
│   ├── TranscriptDisplay.tsx    # 文字起こし・分析結果表示
│   └── ErrorBoundary.tsx        # エラーハンドリング
├── hooks/
│   ├── useAudioRecording.ts     # 音声録音フック
│   ├── useSpeechRecognition.ts  # 音声認識フック
│   └── useSentimentAnalysis.ts  # 感情分析フック
├── utils/
│   ├── sentimentAnalyzer.ts     # 感情分析エンジン
│   ├── audioProcessor.ts        # 音声処理ユーティリティ
│   └── constants.ts             # 定数定義
├── types/
│   └── index.ts                 # TypeScript型定義
└── App.tsx                      # メインアプリケーション
```

## 🔐 セキュリティ要件

- **HTTPS必須**: Web Audio APIとWeb Speech APIの使用にはHTTPS環境が必要
- **マイクアクセス許可**: ユーザーによるマイクアクセス許可が必要
- **プライバシー保護**: 音声データは保存されません（メモリ内処理のみ）

## 🌐 ブラウザサポート

- **Chrome**: 推奨ブラウザ
- **Safari**: サポート
- **Firefox**: サポート
- **Edge**: サポート

## ⚠️ 制約事項

- HTTPS環境でのみ動作
- マイクアクセスが必要
- 日本語音声のみ対応
- インターネット接続が必要（感情分析とWeb Speech API）
- 文字起こしテキストがリアルタイムで画面に表示されます
- 音声データはローカル処理のみ（サーバー送信なし）

## 🧪 感情分析モデル

### 使用モデル
**HuggingFace DistilBERT (メイン) + キーワードベース (フォールバック)**
- **主要モデル**: `lxyuan/distilbert-base-multilingual-cased-sentiments-student`
- **モデルタイプ**: 多言語対応DistilBERT（Transformer）
- **API**: HuggingFace Inference API
- **分類**: 3クラス分類 (ポジティブ/ネガティブ/ニュートラル)
- **フォールバック**: 日本語キーワードベース分析システム

### アルゴリズム詳細

#### 主要分析（HuggingFace DistilBERT）
- **モデル**: `lxyuan/distilbert-base-multilingual-cased-sentiments-student`
- **アーキテクチャ**: DistilBERT（BERT軽量版）
- **多言語対応**: 日本語を含む複数言語をサポート
- **API経由**: HuggingFace Inference APIを使用
- **出力**: ラベル（positive/negative/neutral）と信頼度スコア

#### フォールバック分析（キーワードベース）
APIエラー時や短文処理時に使用される日本語特化システム：

- **ポジティブキーワード**: 良い、嬉しい、楽しい、最高、素晴らしい、好き
- **ネガティブキーワード**: 悪い、悲しい、辛い、最悪、嫌い、怒り

#### 判定プロセス
1. **前処理**: 音声認識で文字起こし、文章正規化
2. **主要分析**: HuggingFace DistilBERTによる感情分析
3. **フォールバック**: API失敗時はキーワードベース分析
4. **信頼度評価**: モデル出力スコアまたはキーワードマッチ率
5. **結果統合**: タイムスタンプ付きで結果を保存

#### 性能特性
- **高精度**: 事前学習済みTransformerによる高精度分析
- **多言語対応**: 日本語を含む複数言語に対応
- **堅牢性**: API障害時のフォールバック機能
- **リアルタイム処理**: 非同期APIコールによる高速処理
- **プライバシー保護**: 音声データはローカル処理のみ

## 🐛 トラブルシューティング

### マイクアクセスエラー
- ブラウザの設定でマイクアクセスを許可してください
- HTTPSではなくHTTPの場合、マイクアクセスが制限されます

### 音声認識が動作しない
- ブラウザが音声認識をサポートしているか確認
- インターネット接続を確認（Web Speech APIはクラウドベース）
- 音量・マイクの動作を確認

### チャートが表示されない
- JavaScript が有効になっているか確認
- Chart.js の読み込みエラーがないか開発者ツールで確認

### 感情分析が動作しない・精度が低い
- **APIキー未設定**: アプリ上部の「API設定」でHuggingFace APIキーを設定してください
- **APIキーエラー**: 正しいAPIキー（hf_で始まる）が設定されているか確認
- インターネット接続を確認（HuggingFace APIアクセス必要）
- ブラウザコンソールでAPIエラーを確認
- APIキーなしまたはAPI障害時は自動的にキーワードベース分析に切り替わります（精度は劣ります）

## 📄 ライセンス

このプロジェクトはMITライセンスのもとで公開されています。

## 🤝 貢献

1. フォークしてください
2. フィーチャーブランチを作成してください (`git checkout -b feature/amazing-feature`)
3. コミットしてください (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュしてください (`git push origin feature/amazing-feature`)
5. プルリクエストを開いてください

## 📞 サポート

質問や問題がある場合は、GitHub Issues で報告してください。

---

© 2024 録音データ感情判定アプリ