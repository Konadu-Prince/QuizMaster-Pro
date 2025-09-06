import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import QuizList from './pages/quiz/QuizList';
import QuizDetail from './pages/quiz/QuizDetail';
import QuizCreate from './pages/quiz/QuizCreate';
import QuizTake from './pages/quiz/QuizTake';
import QuizResults from './pages/quiz/QuizResults';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

// Global Styles
import './index.css';

function App() {
  return (
    <HelmetProvider>
      <Provider store={store}>
        <AuthProvider>
          <ThemeProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Navbar />
                
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/quizzes" element={<QuizList />} />
                    <Route path="/quizzes/:id" element={<QuizDetail />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/quiz/create" element={
                      <ProtectedRoute>
                        <QuizCreate />
                      </ProtectedRoute>
                    } />
                    <Route path="/quiz/:id/take" element={
                      <ProtectedRoute>
                        <QuizTake />
                      </ProtectedRoute>
                    } />
                    <Route path="/quiz/:id/results/:attemptId" element={
                      <ProtectedRoute>
                        <QuizResults />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                
                <Footer />
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </HelmetProvider>
  );
}

export default App;