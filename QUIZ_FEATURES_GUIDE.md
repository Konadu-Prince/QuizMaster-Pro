# 🎯 QuizMaster-Pro Features Guide

## 🆕 New Features Added

### 1. **Quiz Preview** 👁️
- **What it does**: Preview your quiz before publishing
- **How to use**: Click the "Preview" button in the quiz creation interface
- **Features**:
  - Shows quiz title, description, and metadata
  - Displays all questions with correct answers highlighted
  - Responsive modal design
  - Easy to close and continue editing

### 2. **Bulk Quiz Import** 📥
- **What it does**: Import multiple questions at once from JSON format
- **How to use**: Click the "Import Quiz" button in the quiz creation interface
- **Features**:
  - Paste JSON data directly into the modal
  - Automatic validation and error handling
  - Supports multiple question types
  - Preserves quiz metadata (title, description, category, difficulty)

## 📋 How to Use Quiz Import

### Step 1: Prepare Your Quiz Data
Create a JSON file with your quiz data following this format:

```json
{
  "title": "Your Quiz Title",
  "description": "Your Quiz Description",
  "category": "general",
  "difficulty": "easy",
  "questions": [
    {
      "question": "What is your question?",
      "type": "multiple-choice",
      "answers": [
        {"text": "Option 1", "correct": false},
        {"text": "Option 2", "correct": true},
        {"text": "Option 3", "correct": false},
        {"text": "Option 4", "correct": false}
      ],
      "points": 1,
      "timeLimit": 60
    }
  ]
}
```

### Step 2: Import the Quiz
1. Go to the Quiz Creation page
2. Click the "Import Quiz" button
3. Paste your JSON data into the text area
4. The quiz will be automatically imported and populated

### Step 3: Review and Edit
1. Use the "Preview" button to review your imported quiz
2. Make any necessary edits
3. Save your quiz

## 📁 Sample Quiz Files

We've created sample quiz files for you to try:

### 1. JavaScript Fundamentals Quiz
- **File**: `sample-quiz.json`
- **Category**: Programming
- **Difficulty**: Intermediate
- **Questions**: 5 JavaScript-related questions

### 2. Basic Mathematics Quiz
- **File**: `sample-math-quiz.json`
- **Category**: Math
- **Difficulty**: Easy
- **Questions**: 5 basic math questions

## 🎯 Supported Question Types

### Multiple Choice
```json
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
```

### True/False
```json
{
  "question": "JavaScript is a programming language.",
  "type": "true-false",
  "answers": [
    {"text": "True", "correct": true},
    {"text": "False", "correct": false}
  ],
  "points": 1,
  "timeLimit": 30
}
```

### Fill in the Blank
```json
{
  "question": "The capital of France is ___.",
  "type": "fill-in-blank",
  "answers": [
    {"text": "Paris", "correct": true}
  ],
  "points": 1,
  "timeLimit": 45
}
```

## 🚀 Quick Start Guide

### For New Users:
1. **Login** to your account at http://localhost:3002/login
2. **Go to Dashboard** and click "Create New Quiz"
3. **Try the Import Feature**:
   - Click "Import Quiz"
   - Copy the content from `sample-quiz.json`
   - Paste it into the import modal
   - Click "Preview" to see your imported quiz
4. **Save your quiz** and publish it

### For Bulk Quiz Creation:
1. **Prepare multiple quiz files** in JSON format
2. **Import each quiz** using the import feature
3. **Customize** titles, descriptions, and categories
4. **Preview** each quiz before saving
5. **Publish** your quizzes

## 🔧 Technical Details

### JSON Format Requirements:
- **title**: Quiz title (string)
- **description**: Quiz description (string)
- **category**: One of: general, science, history, math, programming, etc.
- **difficulty**: One of: easy, medium, hard
- **questions**: Array of question objects
- **question**: Question text (string)
- **type**: Question type (multiple-choice, true-false, fill-in-blank)
- **answers**: Array of answer objects
- **text**: Answer text (string)
- **correct**: Boolean indicating if answer is correct
- **points**: Points for the question (number)
- **timeLimit**: Time limit in seconds (number)

### Error Handling:
- Invalid JSON format will show an error message
- Missing required fields will be handled gracefully
- Duplicate questions will be preserved
- Invalid question types will default to multiple-choice

## 🎉 Benefits

### For Quiz Creators:
- **Save Time**: Import multiple questions at once
- **Preview Before Publishing**: See exactly how your quiz will look
- **Bulk Creation**: Create multiple quizzes quickly
- **Error Prevention**: Catch issues before publishing

### For Users:
- **Better Quality**: Previewed quizzes are more polished
- **More Content**: Faster quiz creation means more available quizzes
- **Consistent Format**: Standardized quiz structure

## 🌐 Access Points

- **Frontend**: http://localhost:3002
- **Quiz Creation**: http://localhost:3002/quiz/create
- **Login**: http://localhost:3002/login
- **Dashboard**: http://localhost:3002/dashboard
- **Backend API**: http://localhost:5002

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your JSON format matches the examples
3. Ensure all required fields are present
4. Try with the sample quiz files first

Happy quiz creating! 🎯

