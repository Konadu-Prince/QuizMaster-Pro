import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Search, 
  Filter,
  TrendingUp,
  Award,
  Calendar,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import ShareModal from '../../components/common/ShareModal';

const QuizList = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState({ isOpen: false, quiz: null });

  const categories = [
    { id: 'all', name: 'All', count: 156 },
    { id: 'programming', name: 'Programming', count: 45 },
    { id: 'react', name: 'React', count: 23 },
    { id: 'css', name: 'CSS', count: 18 },
    { id: 'javascript', name: 'JavaScript', count: 32 },
    { id: 'web-development', name: 'Web Development', count: 28 },
    { id: 'data-science', name: 'Data Science', count: 15 },
    { id: 'design', name: 'Design', count: 12 }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'difficulty', label: 'Difficulty' }
  ];

  const mockQuizzes = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics including variables, functions, and objects. Perfect for beginners starting their coding journey.',
      category: 'Programming',
      difficulty: 'Beginner',
      questions: 15,
      timeLimit: 30,
      attempts: 1234,
      rating: 4.8,
      author: 'John Doe',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      createdAt: '2024-01-15',
      tags: ['JavaScript', 'Basics', 'Programming'],
      isBookmarked: false,
      views: 5432
    },
    {
      id: 2,
      title: 'React Hooks Deep Dive',
      description: 'Master React hooks including useState, useEffect, and custom hooks. Learn advanced patterns and best practices.',
      category: 'React',
      difficulty: 'Intermediate',
      questions: 20,
      timeLimit: 45,
      attempts: 856,
      rating: 4.9,
      author: 'Jane Smith',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      createdAt: '2024-01-10',
      tags: ['React', 'Hooks', 'Frontend'],
      isBookmarked: true,
      views: 3210
    },
    {
      id: 3,
      title: 'CSS Grid Layout Mastery',
      description: 'Learn CSS Grid layout system with practical examples and exercises. Build responsive layouts like a pro.',
      category: 'CSS',
      difficulty: 'Intermediate',
      questions: 12,
      timeLimit: 25,
      attempts: 567,
      rating: 4.7,
      author: 'Mike Johnson',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      createdAt: '2024-01-08',
      tags: ['CSS', 'Grid', 'Layout'],
      isBookmarked: false,
      views: 2890
    },
    {
      id: 4,
      title: 'Python Data Analysis',
      description: 'Comprehensive quiz covering pandas, numpy, and matplotlib for data analysis and visualization.',
      category: 'Data Science',
      difficulty: 'Advanced',
      questions: 25,
      timeLimit: 60,
      attempts: 234,
      rating: 4.6,
      author: 'Sarah Wilson',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      createdAt: '2024-01-05',
      tags: ['Python', 'Data Science', 'Pandas'],
      isBookmarked: true,
      views: 1876
    },
    {
      id: 5,
      title: 'UI/UX Design Principles',
      description: 'Test your knowledge of user interface and user experience design principles and best practices.',
      category: 'Design',
      difficulty: 'Beginner',
      questions: 18,
      timeLimit: 35,
      attempts: 445,
      rating: 4.5,
      author: 'Alex Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      createdAt: '2024-01-03',
      tags: ['UI/UX', 'Design', 'Principles'],
      isBookmarked: false,
      views: 2100
    },
    {
      id: 6,
      title: 'Node.js Backend Development',
      description: 'Advanced quiz covering Express.js, middleware, authentication, and database integration.',
      category: 'Web Development',
      difficulty: 'Advanced',
      questions: 22,
      timeLimit: 50,
      attempts: 189,
      rating: 4.8,
      author: 'David Rodriguez',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      createdAt: '2024-01-01',
      tags: ['Node.js', 'Backend', 'Express'],
      isBookmarked: true,
      views: 1654
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setQuizzes(mockQuizzes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCategory = selectedCategory === 'All' || quiz.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.attempts - a.attempts;
      case 'recent':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'rating':
        return b.rating - a.rating;
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      default:
        return 0;
    }
  });

  const toggleBookmark = (quizId) => {
    setQuizzes(quizzes.map(quiz => 
      quiz.id === quizId ? { ...quiz, isBookmarked: !quiz.isBookmarked } : quiz
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Explore Quizzes - QuizMaster Pro</title>
        <meta name="description" content="Discover and take quizzes created by our community of educators and experts. Find quizzes on programming, design, data science, and more." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Quizzes
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Discover and take quizzes created by our community of educators and experts. 
              Find the perfect quiz to test your knowledge and learn something new.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Quizzes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12.5K</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4.7</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search quizzes, topics, or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div className="lg:w-48">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.name
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-75">({category.count})</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <p className="text-gray-600 dark:text-gray-400">
              Showing {sortedQuizzes.length} of {quizzes.length} quizzes
            </p>
          </motion.div>

          {/* Quiz Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          quiz.difficulty === 'Beginner' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : quiz.difficulty === 'Intermediate'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {quiz.difficulty}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {quiz.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {quiz.description}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleBookmark(quiz.id)}
                      className={`p-2 rounded-full transition-colors ${
                        quiz.isBookmarked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${quiz.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {quiz.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {quiz.questions} questions
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      {quiz.timeLimit} min
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2" />
                      {quiz.attempts.toLocaleString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                      {quiz.rating}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={quiz.authorAvatar}
                        alt={quiz.author}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {quiz.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Eye className="h-3 w-3 mr-1" />
                      {quiz.views.toLocaleString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/quizzes/${quiz.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                    >
                      Take Quiz
                    </Link>
                    <button 
                      onClick={() => setShareModal({ isOpen: true, quiz })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      title="Share quiz"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Load More */}
          {sortedQuizzes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-12"
            >
              <button className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">
                Load More Quizzes
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {sortedQuizzes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center py-12"
            >
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No quizzes found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
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

export default QuizList;
