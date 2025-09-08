/**
 * Advanced Quiz Analytics Component
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award,
  Download,
  Filter,
  Calendar,
  Eye,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

const QuizAnalytics = ({ quizId, quizData }) => {
  const [analytics, setAnalytics] = useState({
    totalAttempts: 0,
    averageScore: 0,
    completionRate: 0,
    averageTime: 0,
    difficultyDistribution: {},
    questionPerformance: [],
    userEngagement: {},
    timeDistribution: [],
    scoreDistribution: [],
    recentActivity: []
  });

  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    const loadAnalytics = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock analytics data
      setAnalytics({
        totalAttempts: 1247,
        averageScore: 78.5,
        completionRate: 89.2,
        averageTime: 12.5,
        difficultyDistribution: {
          easy: 45,
          medium: 35,
          hard: 20
        },
        questionPerformance: [
          { id: 1, text: "What is React?", accuracy: 95, avgTime: 8.2 },
          { id: 2, text: "Explain useState hook", accuracy: 78, avgTime: 15.3 },
          { id: 3, text: "What is JSX?", accuracy: 88, avgTime: 6.7 },
          { id: 4, text: "Explain useEffect", accuracy: 72, avgTime: 18.9 },
          { id: 5, text: "What is Redux?", accuracy: 65, avgTime: 22.1 }
        ],
        userEngagement: {
          likes: 234,
          shares: 45,
          comments: 67,
          bookmarks: 89
        },
        timeDistribution: [
          { hour: 0, attempts: 12 },
          { hour: 1, attempts: 8 },
          { hour: 2, attempts: 5 },
          { hour: 3, attempts: 3 },
          { hour: 4, attempts: 2 },
          { hour: 5, attempts: 4 },
          { hour: 6, attempts: 15 },
          { hour: 7, attempts: 28 },
          { hour: 8, attempts: 45 },
          { hour: 9, attempts: 67 },
          { hour: 10, attempts: 89 },
          { hour: 11, attempts: 95 },
          { hour: 12, attempts: 78 },
          { hour: 13, attempts: 82 },
          { hour: 14, attempts: 88 },
          { hour: 15, attempts: 92 },
          { hour: 16, attempts: 85 },
          { hour: 17, attempts: 76 },
          { hour: 18, attempts: 68 },
          { hour: 19, attempts: 54 },
          { hour: 20, attempts: 42 },
          { hour: 21, attempts: 35 },
          { hour: 22, attempts: 28 },
          { hour: 23, attempts: 18 }
        ],
        scoreDistribution: [
          { range: "0-20", count: 23 },
          { range: "21-40", count: 45 },
          { range: "41-60", count: 78 },
          { range: "61-80", count: 156 },
          { range: "81-100", count: 234 }
        ],
        recentActivity: [
          { user: "John Doe", action: "completed", score: 85, time: "2 minutes ago" },
          { user: "Jane Smith", action: "started", score: null, time: "5 minutes ago" },
          { user: "Mike Johnson", action: "completed", score: 92, time: "8 minutes ago" },
          { user: "Sarah Wilson", action: "bookmarked", score: null, time: "12 minutes ago" },
          { user: "David Brown", action: "completed", score: 78, time: "15 minutes ago" }
        ]
      });
      
      setIsLoading(false);
    };

    loadAnalytics();
  }, [quizId, timeRange]);

  const exportAnalytics = () => {
    const data = {
      quizId,
      timeRange,
      analytics,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-analytics-${quizId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quiz Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Attempts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.totalAttempts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.averageScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.completionRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.averageTime}m
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Score Distribution
          </h3>
          <div className="space-y-3">
            {analytics.scoreDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.range}%
                </span>
                <div className="flex items-center gap-3 flex-1 mx-4">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(item.count / Math.max(...analytics.scoreDistribution.map(s => s.count))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Engagement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Engagement
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <ThumbsUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.userEngagement.likes}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Likes</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.userEngagement.comments}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Comments</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.userEngagement.shares}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shares</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Award className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.userEngagement.bookmarks}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Question Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg. Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.questionPerformance.map((question, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      Q{question.id}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {question.text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      question.accuracy >= 80 ? 'text-green-600' :
                      question.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {question.accuracy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {question.avgTime}s
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            question.accuracy >= 80 ? 'bg-green-600' :
                            question.accuracy >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${question.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {analytics.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.user}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.action} the quiz
                    {activity.score && ` • Score: ${activity.score}%`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
