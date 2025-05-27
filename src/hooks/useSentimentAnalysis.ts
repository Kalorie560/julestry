import { useState, useCallback, useRef } from 'react';
import { SentimentResult, SentimentStats } from '../types';
import { SentimentAnalyzer } from '../utils/sentimentAnalyzer';

export const useSentimentAnalysis = () => {
  const [sentimentResults, setSentimentResults] = useState<SentimentResult[]>([]);
  const [sentimentStats, setSentimentStats] = useState<SentimentStats>({
    positive: 0,
    negative: 0,
    neutral: 0,
    total: 0,
  });

  const analyzer = useRef(new SentimentAnalyzer());

  const calculateStats = useCallback((results: SentimentResult[]): SentimentStats => {
    const stats = results.reduce(
      (acc, result) => {
        acc[result.sentiment]++;
        acc.total++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0, total: 0 }
    );

    return stats;
  }, []);

  const analyzeText = useCallback((text: string) => {
    if (!text || text.trim().length < 3) {
      return;
    }

    const result = analyzer.current.analyzeSentiment(text);
    
    setSentimentResults(prev => {
      const newResults = [...prev, result];
      // Keep only the last 100 results for performance
      const limitedResults = newResults.slice(-100);
      
      // Update stats
      setSentimentStats(calculateStats(limitedResults));
      
      return limitedResults;
    });
  }, [calculateStats]);

  const resetAnalysis = useCallback(() => {
    setSentimentResults([]);
    setSentimentStats({
      positive: 0,
      negative: 0,
      neutral: 0,
      total: 0,
    });
  }, []);

  const getPercentages = useCallback(() => {
    if (sentimentStats.total === 0) {
      return { positive: 0, negative: 0, neutral: 0 };
    }

    return {
      positive: Math.round((sentimentStats.positive / sentimentStats.total) * 100),
      negative: Math.round((sentimentStats.negative / sentimentStats.total) * 100),
      neutral: Math.round((sentimentStats.neutral / sentimentStats.total) * 100),
    };
  }, [sentimentStats]);

  return {
    sentimentResults,
    sentimentStats,
    analyzeText,
    resetAnalysis,
    getPercentages,
  };
};