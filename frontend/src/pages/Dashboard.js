import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserQuizzes } from '../store/slices/quizSlice';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  Eye,
  Edit
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userQuizzes, isLoading } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(fetchUserQuizzes());
  }, [dispatch]);

  // Use real data from API
  const displayQuizzes = userQuizzes;

  // Calculate stats from user data
  const totalQuizzes = displayQuizzes.length;
  const publishedQuizzes = displayQuizzes.filter(quiz => quiz.isPublished).length;
  const totalAttempts = displayQuizzes.reduce((sum, quiz) => sum + (quiz.stats?.totalAttempts || 0), 0);
  const averageScore = displayQuizzes.length > 0 
    ? Math.round(displayQuizzes.reduce((sum, quiz) => sum + (quiz.stats?.averageScore || 0), 0) / displayQuizzes.length)
    : 0;

  const stats = [
    { name: 'Quizzes Created', value: totalQuizzes.toString(), icon: BookOpen, change: `${publishedQuizzes} published` },
    { name: 'Total Attempts', value: totalAttempts.toString(), icon: Users, change: 'Across all quizzes' },
    { name: 'Average Score', value: `${averageScore}%`, icon: TrendingUp, change: 'Quiz performance' },
    { name: 'Published Quizzes', value: publishedQuizzes.toString(), icon: Trophy, change: 'Public quizzes' },
  ];

  const recentQuizzes = displayQuizzes.slice(0, 5);

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
          <Breadcrumb />
          
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
                  {isLoading ? (
                    <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading quizzes...
                    </div>
                  ) : recentQuizzes.length > 0 ? (
                    recentQuizzes.map((quiz) => (
                      <div key={quiz._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {quiz.title}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {quiz.stats?.totalAttempts || 0} attempts
                              </span>
                              <span className="flex items-center">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                {quiz.stats?.averageScore || 0}% avg
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {new Date(quiz.updatedAt).toLocaleDateString()}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                quiz.isPublished 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {quiz.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/quiz/${quiz._id}`}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/quiz/edit/${quiz._id}`}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-lg font-medium mb-2">No quizzes yet</p>
                      <p className="text-sm mb-4">Create your first quiz to get started!</p>
                      <Link
                        to="/quiz/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Quiz
                      </Link>
                    </div>
                  )}
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
