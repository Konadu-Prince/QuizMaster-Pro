import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  Star
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Quizzes Created', value: '12', icon: BookOpen, change: '+2 this month' },
    { name: 'Total Attempts', value: '1,234', icon: Users, change: '+12% from last month' },
    { name: 'Average Score', value: '87%', icon: TrendingUp, change: '+5% from last month' },
    { name: 'Leaderboard Rank', value: '#3', icon: Trophy, change: 'Up 2 positions' },
  ];

  const recentQuizzes = [
    { id: 1, title: 'JavaScript Fundamentals', attempts: 45, avgScore: 92, lastUpdated: '2 hours ago' },
    { id: 2, title: 'React Hooks Quiz', attempts: 32, avgScore: 88, lastUpdated: '1 day ago' },
    { id: 3, title: 'CSS Grid Layout', attempts: 28, avgScore: 85, lastUpdated: '3 days ago' },
  ];

  const recentActivity = [
    { type: 'quiz_created', message: 'Created "Advanced JavaScript" quiz', time: '2 hours ago' },
    { type: 'quiz_taken', message: 'Someone completed "React Basics" with 95% score', time: '4 hours ago' },
    { type: 'achievement', message: 'Earned "Quiz Master" badge', time: '1 day ago' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - QuizMaster Pro</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Here's what's happening with your quizzes today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Quizzes */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Recent Quizzes
                    </h2>
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      <Plus className="h-4 w-4" />
                      <span>Create New</span>
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {quiz.title}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {quiz.attempts} attempts
                            </span>
                            <span className="flex items-center">
                              <BarChart3 className="h-4 w-4 mr-1" />
                              {quiz.avgScore}% avg
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {quiz.lastUpdated}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                            View
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
