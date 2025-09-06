# QuizMaster Pro API Documentation

## Base URL
```
Production: https://api.quizmasterpro.com
Development: http://localhost:5002
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Quizzes

#### Get All Quizzes
```http
GET /api/quizzes?page=1&limit=10&category=Science&difficulty=medium
```

#### Get Quiz by ID
```http
GET /api/quizzes/:id
```

#### Create Quiz
```http
POST /api/quizzes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "JavaScript Fundamentals",
  "description": "Test your JavaScript knowledge",
  "category": "Technology",
  "difficulty": "medium",
  "questions": [
    {
      "question": "What is the result of 2 + '2'?",
      "type": "multiple-choice",
      "options": ["4", "22", "NaN", "Error"],
      "correctAnswer": "22",
      "explanation": "JavaScript converts the number to string and concatenates",
      "points": 1,
      "timeLimit": 30
    }
  ],
  "settings": {
    "timeLimit": 10,
    "showCorrectAnswers": true,
    "allowRetake": true
  }
}
```

#### Update Quiz
```http
PUT /api/quizzes/:id
Authorization: Bearer <token>
```

#### Delete Quiz
```http
DELETE /api/quizzes/:id
Authorization: Bearer <token>
```

### Quiz Attempts

#### Start Quiz Attempt
```http
POST /api/attempts
Authorization: Bearer <token>
Content-Type: application/json

{
  "quizId": "quiz-id-here"
}
```

#### Submit Quiz Answers
```http
PUT /api/attempts/:attemptId
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "question-id-1",
      "answer": "22",
      "timeSpent": 15
    }
  ]
}
```

#### Get Attempt Results
```http
GET /api/attempts/:attemptId
Authorization: Bearer <token>
```

### Analytics

#### Get User Dashboard
```http
GET /api/analytics/dashboard?period=30d
Authorization: Bearer <token>
```

#### Get Quiz Analytics
```http
GET /api/analytics/quiz/:quizId
Authorization: Bearer <token>
```

#### Get Leaderboard
```http
GET /api/analytics/leaderboard?category=Science&period=30d
```

### Payments

#### Create Customer
```http
POST /api/payments/create-customer
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Doe"
}
```

#### Create Subscription
```http
POST /api/payments/create-subscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "priceId": "price_1234567890",
  "customerId": "cus_1234567890"
}
```

#### Get Subscription
```http
GET /api/payments/subscription
Authorization: Bearer <token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to 100 requests per 15 minutes per IP address.

## Pagination

List endpoints support pagination:

```
GET /api/quizzes?page=1&limit=10
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns detailed error messages. Common error scenarios:

- **Validation Errors**: 400 with field-specific error messages
- **Authentication Required**: 401 with "Access denied" message
- **Insufficient Permissions**: 403 with permission details
- **Resource Not Found**: 404 with resource identifier
- **Rate Limit Exceeded**: 429 with retry information
