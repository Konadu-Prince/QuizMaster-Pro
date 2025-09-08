import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchQuizById, 
  startQuizAttempt, 
  submitAnswer, 
  completeQuizAttempt,
  clearCurrentAttempt 
} from '../../store/slices/quizSlice';
import { 
  Clock, 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight,
  Flag
} from 'lucide-react';

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentQuiz, currentAttempt, attemptResults, isLoading, isAttemptLoading, error } = useSelector((state) => state.quiz);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/quiz/${id}` } } });
      return;
    }

    dispatch(fetchQuizById(id));
    
    return () => {
      dispatch(clearCurrentAttempt());
    };
  }, [id, isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (currentQuiz && !currentAttempt) {
      dispatch(startQuizAttempt(id));
    }
  }, [currentQuiz, currentAttempt, id, dispatch]);

  useEffect(() => {
    if (currentAttempt && currentAttempt.quiz?.settings?.timeLimit) {
      setTimeLeft(currentAttempt.quiz.settings.timeLimit * 60); // Convert minutes to seconds
    }
  }, [currentAttempt]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        setTimeSpent(timeSpent + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleCompleteQuiz();
    }
  }, [timeLeft, timeSpent]);

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer && currentAttempt) {
      const currentQuestion = currentQuiz.questions[currentQuestionIndex];
      dispatch(submitAnswer({
        attemptId: currentAttempt._id,
        questionId: currentQuestion._id,
        selectedAnswer,
        timeSpent: timeSpent
      }));
      
      setTimeSpent(0);
      setSelectedAnswer(null);
      
      if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        handleCompleteQuiz();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
    }
  };

  const handleCompleteQuiz = useCallback(() => {
    if (currentAttempt) {
      dispatch(completeQuizAttempt(currentAttempt._id));
    }
  }, [currentAttempt, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || isAttemptLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (attemptResults) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Completed!
            </h1>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {attemptResults.score}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {attemptResults.correctAnswers}/{attemptResults.totalQuestions}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => navigate('/quizzes')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Quizzes
              </button>
              <button
                onClick={() => navigate(`/quiz/${id}`)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuiz || !currentAttempt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

  return (
    <>
      <Helmet>
        <title>{currentQuiz.title} - QuizMaster Pro</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentQuiz.title}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                </p>
              </div>
              {timeLeft !== null && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h2>
            
            <div className="space-y-3">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer._id}
                  onClick={() => handleAnswerSelect(answer._id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === answer._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center">
                    {selectedAnswer === answer._id ? (
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span className="text-gray-900 dark:text-white">{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>
              
              <div className="flex space-x-2">
                {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteQuiz}
                    disabled={!selectedAnswer}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Finish Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizTake;
