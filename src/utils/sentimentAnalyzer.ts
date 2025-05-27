import { SentimentResult, SentimentType } from '../types';

interface HuggingFaceResponse {
  label: string;
  score: number;
}

const HUGGINGFACE_MODEL = 'lxyuan/distilbert-base-multilingual-cased-sentiments-student';
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

export class SentimentAnalyzer {
  private async callHuggingFaceAPI(text: string): Promise<HuggingFaceResponse[]> {
    try {
      const apiKey = process.env.REACT_APP_HUGGINGFACE_API_KEY;
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
    if (lowerLabel.includes('positive')) return 'positive';
    if (lowerLabel.includes('negative')) return 'negative';
    return 'neutral';
  }

  private fallbackAnalysis(text: string): SentimentResult {
    // Enhanced fallback analysis with better Japanese and English support
    const positiveKeywords = [
      // Japanese positive words
      '良い', '嬉しい', '楽しい', '最高', '素晴らしい', '好き', '愛', '幸せ', 
      '感謝', '安心', '満足', '成功', '勝利', '快適', '平和', '美しい',
      'よかった', 'いいね', 'すごい', 'かわいい', '優秀', '完璧', '素敵',
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
    const negationWords = ['not', 'no', 'never', 'ない', 'じゃない', 'ではない'];
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
    let confidence = 0.5; // Start with higher baseline confidence

    const totalSentimentWords = positiveScore + negativeScore;
    const scoreDifference = Math.abs(positiveScore - negativeScore);

    if (positiveScore > negativeScore) {
      sentiment = 'positive';
      // Calculate confidence based on keyword density and score difference
      confidence = Math.min(0.9, 0.5 + (scoreDifference / Math.max(totalWords, 1)) * 2 + (totalSentimentWords * 0.1));
    } else if (negativeScore > positiveScore) {
      sentiment = 'negative';
      confidence = Math.min(0.9, 0.5 + (scoreDifference / Math.max(totalWords, 1)) * 2 + (totalSentimentWords * 0.1));
    } else if (totalSentimentWords > 0) {
      // When scores are equal but sentiment words exist, lean towards neutral with medium confidence
      confidence = 0.6;
    } else {
      // No sentiment words found
      confidence = 0.4;
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
    if (!text || text.trim().length < 3) {
      return {
        text,
        sentiment: 'neutral',
        confidence: 0,
        timestamp: Date.now(),
      };
    }

    try {
      const results = await this.callHuggingFaceAPI(text.trim());
      
      if (results && results.length > 0) {
        // Get the highest scoring result
        const bestResult = results.reduce((prev, curr) => 
          curr.score > prev.score ? curr : prev
        );

        const sentiment = this.mapHuggingFaceToSentiment(bestResult.label);
        
        return {
          text: text.trim(),
          sentiment,
          confidence: bestResult.score,
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