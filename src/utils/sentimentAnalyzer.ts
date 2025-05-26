import { SentimentResult, SentimentType } from '../types';

interface SentimentKeywords {
  positive: string[];
  negative: string[];
  intensifiers: string[];
  negators: string[];
}

const SENTIMENT_KEYWORDS: SentimentKeywords = {
  positive: [
    '嬉しい', '楽しい', '良い', '最高', '素晴らしい', '幸せ', '愛してる', '大好き',
    '感謝', 'ありがとう', '成功', '達成', '喜び', '笑顔', '明るい', '希望',
    '優秀', '完璧', '美しい', 'かわいい', '素敵', '快適', '満足', '安心',
    'ワクワク', 'ドキドキ', '興奮', '感動', '励まし', '応援', '頑張る', '元気',
    '健康', '平和', '自由', '勝利', '栄光', '光栄', '誇り', '自信'
  ],
  negative: [
    '悲しい', '辛い', '悪い', '最悪', 'ひどい', '不幸', '嫌い', '憎い',
    '怒り', '腹立つ', '失敗', '挫折', '絶望', '涙', '暗い', '重い',
    '劣悪', '不完全', '醜い', '嫌な', 'つまらない', '不快', '不満', '不安',
    '心配', '恐怖', '怖い', 'ショック', '落胆', '諦め', '疲れ', '病気',
    '混乱', '困る', '問題', '危険', '痛い', '苦しい', 'ストレス', '圧迫',
    'だめ', 'むかつく', 'うざい', 'きつい', '面倒', '迷惑'
  ],
  intensifiers: [
    'とても', 'すごく', '非常に', '本当に', '実に', 'かなり', 'めちゃくちゃ',
    'すごい', '超', '激', '死ぬほど', '半端ない', '物凄く', '相当', '随分'
  ],
  negators: [
    'ない', 'ません', 'じゃない', 'ではない', 'とは限らない', 'わけではない',
    '〜ぬ', '〜ず', 'なし', '無理', '不可能'
  ]
};

export class SentimentAnalyzer {
  private calculateSentimentScore(text: string): { score: number; confidence: number } {
    const words = text.split(/[\s\u3000\u3001-\u303F\u30A1-\u30FA\u30FC-\u30FE\uFF01-\uFF9F]+/);
    let score = 0;
    let matchCount = 0;
    let intensifierMultiplier = 1;
    let hasNegator = false;

    // Check for negators first
    hasNegator = SENTIMENT_KEYWORDS.negators.some(negator => 
      text.includes(negator)
    );

    // Check for intensifiers
    const intensifierFound = SENTIMENT_KEYWORDS.intensifiers.some(intensifier => 
      text.includes(intensifier)
    );
    if (intensifierFound) {
      intensifierMultiplier = 1.5;
    }

    // Calculate sentiment score
    for (const word of words) {
      if (SENTIMENT_KEYWORDS.positive.includes(word)) {
        score += 1 * intensifierMultiplier;
        matchCount++;
      } else if (SENTIMENT_KEYWORDS.negative.includes(word)) {
        score -= 1 * intensifierMultiplier;
        matchCount++;
      }
    }

    // Apply negation
    if (hasNegator && score !== 0) {
      score = -score;
    }

    // Calculate confidence based on match count and text length
    const confidence = Math.min(0.9, Math.max(0.1, matchCount / Math.max(1, words.length) * 2));

    return { score, confidence };
  }

  private determineSentiment(score: number): SentimentType {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
  }

  analyzeSentiment(text: string): SentimentResult {
    // Filter out very short or empty texts
    if (!text || text.trim().length < 3) {
      return {
        text,
        sentiment: 'neutral',
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    const { score, confidence } = this.calculateSentimentScore(text);
    const normalizedScore = Math.max(-1, Math.min(1, score / 3)); // Normalize to -1 to 1 range
    const sentiment = this.determineSentiment(normalizedScore);

    return {
      text: text.trim(),
      sentiment,
      confidence,
      timestamp: Date.now(),
    };
  }

  // Batch analysis for multiple texts
  analyzeMultiple(texts: string[]): SentimentResult[] {
    return texts.map(text => this.analyzeSentiment(text));
  }
}