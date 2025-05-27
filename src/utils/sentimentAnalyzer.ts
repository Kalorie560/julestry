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
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    // Simple fallback based on basic keywords
    const positiveKeywords = ['良い', '嬉しい', '楽しい', '最高', '素晴らしい', '好き'];
    const negativeKeywords = ['悪い', '悲しい', '辛い', '最悪', '嫌い', '怒り'];
    
    const words = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveKeywords.forEach(keyword => {
      if (words.includes(keyword)) positiveCount++;
    });

    negativeKeywords.forEach(keyword => {
      if (words.includes(keyword)) negativeCount++;
    });

    let sentiment: SentimentType = 'neutral';
    let confidence = 0.3; // Lower confidence for fallback

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.7, 0.3 + (positiveCount * 0.1));
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.7, 0.3 + (negativeCount * 0.1));
    }

    return {
      text: text.trim(),
      sentiment,
      confidence,
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