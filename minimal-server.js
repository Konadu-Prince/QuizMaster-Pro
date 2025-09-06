const express = require('express');
const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'QuizMaster Pro API is running',
    timestamp: new Date().toISOString(),
    environment: 'development',
    port: PORT
  });
});

app.get('/api/quizzes', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "JavaScript Fundamentals",
        category: "Technology",
        difficulty: "medium",
        questions: 5,
        author: "Demo User"
      },
      {
        id: 2,
        title: "World Geography",
        category: "Geography",
        difficulty: "easy",
        questions: 10,
        author: "Demo User"
      }
    ]
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 1250,
      activeUsers: 890,
      premiumUsers: 156
    }
  });
});

// Serve the demo page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/simple-demo.html');
});

app.listen(PORT, () => {
  console.log(`
🚀 QuizMaster Pro Server is running!
📍 Environment: development
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/health
🎯 Demo Page: http://localhost:${PORT}/
  `);
});
