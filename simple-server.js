const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5002;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      message: 'QuizMaster Pro API is running',
      timestamp: new Date().toISOString(),
      port: PORT
    }));
  } else if (req.url === '/api/quizzes') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: [
        { id: 1, title: "JavaScript Fundamentals", category: "Technology", difficulty: "medium" },
        { id: 2, title: "World Geography", category: "Geography", difficulty: "easy" },
        { id: 3, title: "Math Basics", category: "Mathematics", difficulty: "easy" }
      ]
    }));
  } else if (req.url === '/api/users') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        totalUsers: 1250,
        activeUsers: 890,
        premiumUsers: 156
      }
    }));
  } else if (req.url === '/') {
    // Serve the demo page
    try {
      const demoPath = path.join(__dirname, 'simple-demo.html');
      const content = fs.readFileSync(demoPath, 'utf8');
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(content);
    } catch (error) {
      res.writeHead(404);
      res.end('Demo page not found');
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 QuizMaster Pro Server running on port ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🎯 Demo: http://localhost:${PORT}`);
});
