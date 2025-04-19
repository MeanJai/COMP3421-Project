import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { database, analytics, auth } from './firebase';
import { ref, onValue } from 'firebase/database';
import { logEvent } from 'firebase/analytics';
import { signOut } from 'firebase/auth';
import clickSound from './assets/sounds/click.mp3';

// The QuizList component displays a list of quizzes fetched from Firebase Realtime Database
// and allows the user to start a quiz, view their score summary, or log out.

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const clickAudio = useMemo(() => new Audio(clickSound), []);

  useEffect(() => {
    const quizzesRef = ref(database, 'quizzes');
    const unsubscribe = onValue(
      quizzesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const quizArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setQuizzes(quizArray);
          setError(null);
          console.log('Quizzes loaded:', quizArray);
          logEvent(analytics, 'screen_view', {
            screen_name: 'quiz_list',
            screen_class: 'QuizListPage',
          });
        } else {
          setError('No quizzes found');
          console.error('No data found at quizzes');
        }
      },
      (error) => {
        setError('Failed to fetch quizzes: ' + error.message);
        console.error('Firebase error:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleStartQuiz = (quizId) => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    console.log('Navigating to quiz:', quizId);
    logEvent(analytics, 'select_quiz', { quiz_id: quizId });
    navigate(`/quiz/${quizId}`);
  };

  const handleRefresh = () => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    window.location.reload();
  };

  const handleLogout = () => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        navigate('/login');
      })
      .catch((err) => console.error('Logout error:', err));
  };

  const handleViewSummary = () => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    navigate('/summary');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
            onClick={handleRefresh}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">
            Choose a Quiz
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={handleViewSummary}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
              View Score Summary
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
              Logout
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white shadow-xl rounded-lg p-6 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:bg-blue-50 active:scale-95"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h2>
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              <p className="text-sm text-gray-500 mb-4">{quiz.questionCount} questions</p>
              <button
                onClick={() => handleStartQuiz(quiz.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
                <span>Start Quiz</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuizList;