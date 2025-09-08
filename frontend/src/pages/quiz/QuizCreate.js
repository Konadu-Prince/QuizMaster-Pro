import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { createQuiz } from '../../store/slices/quizSlice';
import { 
  Plus, 
  X, 
  Save, 
  Eye, 
  Trash2,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.quiz);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    difficulty: 'easy',
    questions: [
      {
        question: '',
        type: 'multiple-choice',
        answers: [
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false },
          { text: '', correct: false }
        ],
        points: 1,
        timeLimit: 60,
        order: 1
      }
    ]
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const categories = [
    { value: 'general', label: 'General Knowledge' },
    { value: 'science', label: 'Science' },
    { value: 'history', label: 'History' },
    { value: 'math', label: 'Mathematics' },
    { value: 'language', label: 'Language' },
    { value: 'technology', label: 'Technology' },
    { value: 'sports', label: 'Sports' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleAnswerChange = (questionIndex, answerIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, qIndex) => 
        qIndex === questionIndex 
          ? {
              ...q,
              answers: q.answers.map((a, aIndex) => 
                aIndex === answerIndex ? { ...a, [field]: value } : a
              )
            }
          : q
      )
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          type: 'multiple-choice',
          answers: [
            { text: '', correct: false },
            { text: '', correct: false },
            { text: '', correct: false },
            { text: '', correct: false }
          ],
          points: 1,
          timeLimit: 60,
          order: prev.questions.length + 1
        }
      ]
    }));
    setCurrentQuestionIndex(formData.questions.length);
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
      if (currentQuestionIndex >= formData.questions.length - 1) {
        setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (formData.questions.some(q => !q.question.trim())) {
      toast.error('Please fill in all questions');
      return;
    }

    if (formData.questions.some(q => q.answers.some(a => !a.text.trim()))) {
      toast.error('Please fill in all answer options');
      return;
    }

    if (formData.questions.some(q => !q.answers.some(a => a.correct))) {
      toast.error('Each question must have at least one correct answer');
      return;
    }

    try {
      const result = await dispatch(createQuiz(formData));
      if (result.type.endsWith('fulfilled')) {
        toast.success('Quiz created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  const handleImportQuizzes = (importedData) => {
    try {
      const parsedData = JSON.parse(importedData);
      if (parsedData.questions && Array.isArray(parsedData.questions)) {
        setFormData(prev => ({
          ...prev,
          title: parsedData.title || prev.title,
          description: parsedData.description || prev.description,
          category: parsedData.category || prev.category,
          difficulty: parsedData.difficulty || prev.difficulty,
          questions: parsedData.questions.map((q, index) => ({
            question: q.question || '',
            type: q.type || 'multiple-choice',
            answers: q.answers || q.options || [
              { text: '', correct: false },
              { text: '', correct: false },
              { text: '', correct: false },
              { text: '', correct: false }
            ],
            points: q.points || 1,
            timeLimit: q.timeLimit || 60,
            order: index + 1
          }))
        }));
        toast.success(`Imported ${parsedData.questions.length} questions successfully!`);
        setShowImportModal(false);
      } else {
        toast.error('Invalid quiz format. Please check your JSON structure.');
      }
    } catch (error) {
      toast.error('Failed to parse quiz data. Please check your JSON format.');
    }
  };

  const currentQuestion = formData.questions[currentQuestionIndex];

  return (
    <>
      <Helmet>
        <title>Create Quiz - QuizMaster Pro</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Quiz</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Build your quiz step by step</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Import Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Quiz Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter quiz title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter quiz description"
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Questions ({formData.questions.length})
                </h2>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>

              {/* Question Navigation */}
              <div className="flex items-center space-x-2 mb-6">
                {formData.questions.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentQuestionIndex === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Current Question */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question {currentQuestionIndex + 1} *
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => handleQuestionChange(currentQuestionIndex, 'question', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your question"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Answer Options *
                  </label>
                  <div className="space-y-2">
                    {currentQuestion.answers.map((answer, answerIndex) => (
                      <div key={answerIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${currentQuestionIndex}`}
                          checked={answer.correct}
                          onChange={() => {
                            // Set all answers to false first
                            currentQuestion.answers.forEach((_, idx) => {
                              handleAnswerChange(currentQuestionIndex, idx, 'correct', false);
                            });
                            // Set current answer to true
                            handleAnswerChange(currentQuestionIndex, answerIndex, 'correct', true);
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(currentQuestionIndex, answerIndex, 'text', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder={`Option ${answerIndex + 1}`}
                          required
                        />
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(currentQuestionIndex)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Create Quiz
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quiz Preview</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{formData.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{formData.description}</p>
                <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Category: {categories.find(c => c.value === formData.category)?.label}</span>
                  <span>Difficulty: {formData.difficulty}</span>
                  <span>Questions: {formData.questions.length}</span>
                </div>
              </div>

              <div className="space-y-6">
                {formData.questions.map((question, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Question {index + 1}: {question.question}
                    </h4>
                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex items-center">
                          <input
                            type="radio"
                            disabled
                            checked={answer.correct}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className={`ml-3 ${answer.correct ? 'text-green-600 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                            {answer.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import Quiz</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Paste your quiz data in JSON format below. The format should include:
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <pre className="text-sm text-gray-800 dark:text-gray-200">
{`{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "category": "general",
  "difficulty": "easy",
  "questions": [
    {
      "question": "What is 2+2?",
      "type": "multiple-choice",
      "answers": [
        {"text": "3", "correct": false},
        {"text": "4", "correct": true},
        {"text": "5", "correct": false}
      ],
      "points": 1,
      "timeLimit": 60
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              <textarea
                placeholder="Paste your quiz JSON data here..."
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    handleImportQuizzes(e.target.value);
                  }
                }}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuizCreate;
