import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Users, Clock, Star, Play, Share2, Heart, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import ShareModal from '../../components/common/ShareModal';

const QuizDetail = () => {
  const [shareModal, setShareModal] = useState({ isOpen: false, quiz: null });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Mock quiz data - in real app, this would come from API
  const quiz = {
    id: 1,
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and objects. Perfect for beginners starting their coding journey.',
    category: 'Programming',
    difficulty: 'Beginner',
    questions: 15,
    duration: 20,
    rating: 4.8,
    attempts: 1250,
    author: 'John Doe',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=200&fit=crop',
    createdAt: '2024-01-15',
    topics: ['Variables', 'Functions', 'Objects', 'Arrays', 'DOM'],
    learningOutcomes: [
      'Understand JavaScript variable declarations',
      'Master function creation and usage',
      'Work with objects and arrays',
      'Manipulate the DOM with JavaScript'
    ]
  };

  return (
    <>
      <Helmet>
        <title>{quiz.title} - QuizMaster Pro</title>
        <meta name="description" content={quiz.description} />
        <meta property="og:title" content={quiz.title} />
        <meta property="og:description" content={quiz.description} />
        <meta property="og:image" content={quiz.image} />
        <meta property="og:url" content={`${window.location.origin}/quizzes/${quiz.id}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="/" className="hover:text-blue-600">Home</a></li>
              <li>/</li>
              <li><a href="/quizzes" className="hover:text-blue-600">Quizzes</a></li>
              <li>/</li>
              <li className="text-gray-900 dark:text-white">{quiz.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Quiz Image */}
                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                  <img
                    src={quiz.image}
                    alt={quiz.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                      {quiz.category}
                    </span>
                  </div>
                </div>

                {/* Quiz Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {quiz.title}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        {quiz.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`p-2 rounded-lg transition-colors ${
                          isLiked 
                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`p-2 rounded-lg transition-colors ${
                          isBookmarked 
                            ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => setShareModal({ isOpen: true, quiz })}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Quiz Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {quiz.questions}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Questions</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {quiz.duration}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Minutes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {quiz.rating}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {quiz.attempts.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Attempts</div>
                    </div>
                  </div>

                  {/* Topics Covered */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Topics Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {quiz.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      What You'll Learn
                    </h3>
                    <ul className="space-y-2">
                      {quiz.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <img
                        src={quiz.authorAvatar}
                        alt={quiz.author}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {quiz.author}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-8"
              >
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {quiz.difficulty}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Difficulty Level</div>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-4 flex items-center justify-center">
                  <Play className="h-5 w-5 mr-2" />
                  Start Quiz
                </button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-gray-900 dark:text-white">{quiz.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Questions</span>
                    <span className="text-gray-900 dark:text-white">{quiz.questions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Duration</span>
                    <span className="text-gray-900 dark:text-white">{quiz.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-gray-900 dark:text-white">{quiz.rating}</span>
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
        title="Share Quiz"
      />
    </>
  );
};

export default QuizDetail;
