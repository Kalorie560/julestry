import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { SentimentStats } from '../types';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

interface SentimentChartProps {
  stats: SentimentStats;
  percentages: { positive: number; negative: number; neutral: number };
}

export const SentimentChart: React.FC<SentimentChartProps> = ({
  stats,
  percentages,
}) => {
  const hasData = stats.total > 0;

  const doughnutData = {
    labels: ['ポジティブ', 'ネガティブ', 'ニュートラル'],
    datasets: [
      {
        data: hasData ? [stats.positive, stats.negative, stats.neutral] : [1, 1, 1],
        backgroundColor: [
          '#10B981', // positive (green)
          '#EF4444', // negative (red)
          '#6B7280', // neutral (gray)
        ],
        borderColor: [
          '#059669',
          '#DC2626',
          '#4B5563',
        ],
        borderWidth: 2,
        hoverBackgroundColor: [
          '#047857',
          '#B91C1C',
          '#374151',
        ],
      },
    ],
  };

  const barData = {
    labels: ['ポジティブ', 'ネガティブ', 'ニュートラル'],
    datasets: [
      {
        label: '感情比率 (%)',
        data: [percentages.positive, percentages.negative, percentages.neutral],
        backgroundColor: [
          '#10B981',
          '#EF4444',
          '#6B7280',
        ],
        borderColor: [
          '#059669',
          '#DC2626',
          '#4B5563',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 12,
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (!hasData) return 'データなし';
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
            return `${label}: ${value}件 (${percentage}%)`;
          },
        },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  if (!hasData) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            感情分析結果
          </h3>
          <div className="bg-gray-100 rounded-lg p-8">
            <div className="text-gray-500 text-sm">
              録音を開始して音声データを分析してください
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          感情分析結果
        </h3>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {percentages.positive}%
            </div>
            <div className="text-sm text-green-700">🟢 ポジティブ</div>
            <div className="text-xs text-green-600">{stats.positive}件</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">
              {percentages.negative}%
            </div>
            <div className="text-sm text-red-700">🔴 ネガティブ</div>
            <div className="text-xs text-red-600">{stats.negative}件</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-600">
              {percentages.neutral}%
            </div>
            <div className="text-sm text-gray-700">⚪ ニュートラル</div>
            <div className="text-xs text-gray-600">{stats.neutral}件</div>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">感情比率（円グラフ）</h4>
          <div className="h-64">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">感情比率（棒グラフ）</h4>
          <div className="h-48">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          総分析数: {stats.total}件
        </div>
      </div>
    </div>
  );
};