import { SentimentResult, SentimentType } from '../types';

interface HuggingFaceResponse {
  label: string;
  score: number;
}

const HUGGINGFACE_MODEL = 'LoneWolfgang/bert-for-japanese-twitter-sentiment';
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

export class SentimentAnalyzer {
  public hasApiKey(): boolean {
    const apiKey = localStorage.getItem('huggingface_api_key') || process.env.REACT_APP_HUGGINGFACE_API_KEY;
    return !!apiKey && apiKey.trim().length > 0;
  }

  private async callHuggingFaceAPI(text: string): Promise<HuggingFaceResponse[]> {
    try {
      // Try to get API key from localStorage first, then fallback to env variable
      const apiKey = localStorage.getItem('huggingface_api_key') || process.env.REACT_APP_HUGGINGFACE_API_KEY;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inputs: text }),
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.warn('HuggingFace API call failed:', error);
      throw error;
    }
  }

  private mapHuggingFaceToSentiment(label: string): SentimentType {
    const lowerLabel = label.toLowerCase();
    
    // Handle the new BERT model's label format
    if (label === 'LABEL_0') return 'negative';
    if (label === 'LABEL_1') return 'neutral';
    if (label === 'LABEL_2') return 'positive';
    
    // Fallback to original mapping for other models
    if (lowerLabel.includes('positive')) return 'positive';
    if (lowerLabel.includes('negative')) return 'negative';
    return 'neutral';
  }

  private fallbackAnalysis(text: string): SentimentResult {
    // Enhanced fallback analysis with better Japanese and English support
    const positiveKeywords = [
      // Japanese positive words
      '良い', 'いい', '嬉しい', '楽しい', '最高', '素晴らしい', '好き', '愛', '幸せ', 
      '感謝', '安心', '満足', '成功', '勝利', '快適', '平和', '美しい', '綺麗',
      'よかった', 'いいね', 'すごい', 'かわいい', '優秀', '完璧', '素敵', '面白い',
      '楽しめる', 'おいしい', '美味しい', '嬉しかった', '良かった', '感動', '興奮',
      'ありがとう', '感激', '喜び', '満足', '充実', '安らぎ', '癒し', '希望',
      'やった', 'すげー', 'やばい', 'すっげー', 'めっちゃ', 'とても', '本当に',
      // English positive words
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
      'love', 'happy', 'joy', 'awesome', 'perfect', 'beautiful', 'nice',
      'brilliant', 'outstanding', 'superb', 'marvelous', 'terrific'
    ];
    
    const negativeKeywords = [
      // Japanese negative words
      '悪い', '悲しい', '辛い', '最悪', '嫌い', '怒り', '憎い', '不安', 
      '失敗', '問題', '困る', '痛い', '苦しい', '疲れた', '心配', '恐怖',
      'だめ', 'ひどい', 'むかつく', '腹立つ', '嫌だ', '最低', '絶望',
      '落ち込む', '憂鬱', '不満', '腹が立つ', '許せない', '嫌になる',
      '困った', '大変', '厳しい', '苦手', 'つまらない', '面倒', '邪魔',
      'やばい', 'まずい', 'きつい', 'しんどい', 'うざい', 'うっとうしい',
      // English negative words
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'sad',
      'frustrated', 'disappointed', 'worried', 'scared', 'disgusting',
      'annoying', 'boring', 'stupid', 'ridiculous', 'pathetic', 'worthless'
    ];

    // Enhanced analysis with punctuation and context consideration
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    let totalWords = text.split(/\s+/).length;

    // Count keyword matches with weighted scoring
    positiveKeywords.forEach(keyword => {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      positiveScore += matches;
    });

    negativeKeywords.forEach(keyword => {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      negativeScore += matches;
    });

    // Consider punctuation patterns
    const exclamationMarks = (text.match(/!/g) || []).length;
    const questionMarks = (text.match(/\?/g) || []).length;
    
    // Boost positive sentiment for exclamation marks in positive context
    if (positiveScore > 0 && exclamationMarks > 0) {
      positiveScore += exclamationMarks * 0.5;
    }
    
    // Consider negation patterns
    const negationWords = ['not', 'no', 'never', 'ない', 'じゃない', 'ではない', 'でない'];
    let hasNegation = false;
    negationWords.forEach(neg => {
      if (lowerText.includes(neg)) hasNegation = true;
    });

    // Adjust scores based on negation
    if (hasNegation) {
      // Swap scores if negation is present
      [positiveScore, negativeScore] = [negativeScore, positiveScore];
    }

    let sentiment: SentimentType = 'neutral';
    let confidence = 0.40; // Start with lower baseline confidence

    const totalSentimentWords = positiveScore + negativeScore;
    const scoreDifference = Math.abs(positiveScore - negativeScore);

    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      // Dynamic confidence calculation based on keyword strength and context
      const keywordRatio = positiveScore / Math.max(totalWords, 1);
      const dominanceRatio = positiveScore / Math.max(totalSentimentWords, 1);
      confidence = Math.min(0.90, 0.40 + (keywordRatio * 2) + (dominanceRatio * 0.3) + (scoreDifference * 0.1));
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      // Dynamic confidence calculation based on keyword strength and context
      const keywordRatio = negativeScore / Math.max(totalWords, 1);
      const dominanceRatio = negativeScore / Math.max(totalSentimentWords, 1);
      confidence = Math.min(0.90, 0.40 + (keywordRatio * 2) + (dominanceRatio * 0.3) + (scoreDifference * 0.1));
    } else if (totalSentimentWords > 0) {
      // When scores are equal but sentiment words exist, confidence varies based on word count
      confidence = Math.min(0.70, 0.50 + (totalSentimentWords * 0.05));
    } else {
      // No sentiment words found - very low confidence with some randomness
      confidence = 0.30 + Math.random() * 0.15; // Random between 0.30-0.45
    }

    return {
      text: text.trim(),
      sentiment,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
      timestamp: Date.now(),
    };
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // Filter out very short or empty texts
    if (!text || text.trim().length < 2) {
      return {
        text,
        sentiment: 'neutral',
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    // For very short texts, use fallback analysis directly
    if (text.trim().length < 5) {
      return this.fallbackAnalysis(text);
    }

    try {
      const results = await this.callHuggingFaceAPI(text.trim());
      
      if (results && results.length > 0) {
        // Get the highest scoring result
        const bestResult = results.reduce((prev, curr) => 
          curr.score > prev.score ? curr : prev
        );

        const sentiment = this.mapHuggingFaceToSentiment(bestResult.label);
        
        // The BERT model typically provides more confident predictions
        // Apply dynamic adjustment based on sentiment strength and text length
        let adjustedConfidence = bestResult.score;
        
        // Adjust confidence based on text length and sentiment strength
        const textLength = text.trim().length;
        const lengthFactor = Math.min(1.0, textLength / 50); // Longer text = higher confidence
        
        if (sentiment !== 'neutral') {
          // For non-neutral sentiments, apply dynamic adjustment
          if (adjustedConfidence < 0.5) {
            adjustedConfidence = Math.min(0.85, adjustedConfidence + (0.10 + lengthFactor * 0.10));
          } else if (adjustedConfidence > 0.8) {
            // Add slight variation for very high confidence scores
            adjustedConfidence = Math.max(0.75, adjustedConfidence - (Math.random() * 0.05));
          }
        } else {
          // For neutral sentiment, add some natural variation
          adjustedConfidence = Math.max(0.40, Math.min(0.80, adjustedConfidence + (Math.random() * 0.1 - 0.05)));
        }
        
        return {
          text: text.trim(),
          sentiment,
          confidence: Math.round(adjustedConfidence * 100) / 100,
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.warn('Using fallback sentiment analysis:', error);
    }

    // Fallback to simple keyword-based analysis
    return this.fallbackAnalysis(text);
  }

  // Batch analysis for multiple texts
  async analyzeMultiple(texts: string[]): Promise<SentimentResult[]> {
    const results = await Promise.allSettled(
      texts.map(text => this.analyzeSentiment(text))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Return fallback result for failed analyses
        return this.fallbackAnalysis(texts[index]);
      }
    });
  }
}