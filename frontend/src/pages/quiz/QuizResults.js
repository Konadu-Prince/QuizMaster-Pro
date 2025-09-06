import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Trophy, Share2, RotateCcw, Home, Award, Target, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ShareModal from '../../components/common/ShareModal';

const QuizResults = () => {
  const [shareModal, setShareModal] = useState({ isOpen: false, quiz: null });

  // Mock quiz results data - in real app, this would come from API
  const quizResults = {
    quiz: {
      id: 1,
      title: 'JavaScript Fundamentals',
      category: 'Programming',
      difficulty: 'Beginner',
      questions: 15,
      duration: 20,
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=200&fit=crop'
    },
    score: 12,
    totalQuestions: 15,
    percentage: 80,
    timeSpent: 18,
    correctAnswers: 12,
    incorrectAnswers: 3,
    grade: 'B+',
    rank: 245,
    totalAttempts: 1250,
    badges: ['First Try', 'Speed Demon', 'JavaScript Pro'],
    performance: {
      excellent: 8,
      good: 4,
      needsImprovement: 3
    },
    topics: [
      { name: 'Variables', score: 100, total: 3 },
      { name: 'Functions', score: 75, total: 4 },
      { name: 'Objects', score: 67, total: 3 },
      { name: 'Arrays', score: 100, total: 3 },
      { name: 'DOM', score: 50, total: 2 }
    ]
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'C+':
      case 'C':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    }
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return "Outstanding! You've mastered this topic!";
    if (percentage >= 80) return "Great job! You have a solid understanding.";
    if (percentage >= 70) return "Good work! Keep practicing to improve.";
    if (percentage >= 60) return "Not bad! Review the topics you missed.";
    return "Keep studying! You'll get there with more practice.";
  };

  return (
    <>
      <Helmet>
        <title>Quiz Results - {quizResults.quiz.title} - QuizMaster Pro</title>
        <meta name="description" content={`You scored ${quizResults.percentage}% on ${quizResults.quiz.title}. ${getPerformanceMessage(quizResults.percentage)}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Completed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's how you performed on "{quizResults.quiz.title}"
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                    {quizResults.percentage}%
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${getGradeColor(quizResults.grade)}`}>
                    Grade: {quizResults.grade}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-3">
                    {getPerformanceMessage(quizResults.percentage)}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {quizResults.correctAnswers}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Correct</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-red-500">
                      {quizResults.incorrectAnswers}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Incorrect</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {quizResults.timeSpent}m
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Time Spent</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      #{quizResults.rank}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Rank</div>
                  </div>
                </div>
              </motion.div>

              {/* Topic Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Topic Performance
                </h3>
                <div className="space-y-4">
                  {quizResults.topics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-900 dark:text-white font-medium">
                            {topic.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {topic.score}% ({Math.round(topic.total * topic.score / 100)}/{topic.total})
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              topic.score >= 80 ? 'bg-green-500' :
                              topic.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Badges */}
              {quizResults.badges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Badges Earned
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {quizResults.badges.map((badge, index) => (
                      <div
                        key={index}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">{badge}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Quiz Info */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={quizResults.quiz.image}
                      alt={quizResults.quiz.title}
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {quizResults.quiz.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {quizResults.quiz.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Difficulty</span>
                      <span className="text-gray-900 dark:text-white">{quizResults.quiz.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Questions</span>
                      <span className="text-gray-900 dark:text-white">{quizResults.quiz.questions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Total Attempts</span>
                      <span className="text-gray-900 dark:text-white">{quizResults.totalAttempts.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    What's Next?
                  </h4>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShareModal({ isOpen: true, quiz: quizResults.quiz })}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Results
                    </button>
                    
                    <Link
                      to={`/quizzes/${quizResults.quiz.id}`}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Link>
                    
                    <Link
                      to="/quizzes"
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Browse More Quizzes
                    </Link>
                  </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Summary
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Excellent Answers
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {quizResults.performance.excellent} questions
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Good Answers
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {quizResults.performance.good} questions
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Needs Improvement
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {quizResults.performance.needsImprovement} questions
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, quiz: null })}
        quiz={shareModal.quiz}
        title="Share Your Results"
      />
    </>
  );
};

export default QuizResults;
