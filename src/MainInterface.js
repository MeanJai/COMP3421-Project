import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import './index.css';
import QuizPage from './QuizPage';
import QuizList from './QuizList';
import Login from './Login';
import Register from './Register';
import ScoreSummary from './ScoreSummary';

// MainInterface component
// This component serves as the main entry point for the application, handling user authentication and routing

function MainInterface() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="text-gray-700 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/"
            element={user ? <QuizList /> : <Navigate to="/login" />}
          />
          <Route
            path="/quiz/:quizId"
            element={user ? <QuizPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/summary"
            element={user ? <ScoreSummary /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default MainInterface;