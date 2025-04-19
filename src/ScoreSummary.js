import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, database } from './firebase';
import { ref, onValue } from 'firebase/database';
import clickSound from './assets/sounds/click.mp3';

// Score Summary component
// This component fetches and displays the user's quiz scores from Firebase Realtime Database

function ScoreSummary() {
  const [scores, setScores] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const clickAudio = useMemo(() => new Audio(clickSound), []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to view scores');
      return;
    }

    const scoresRef = ref(database, `scores/${user.uid}`);
    const unsubscribe = onValue(
      scoresRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const scoreArray = Object.entries(data).map(([quizId, scoreData]) => ({
            quizId,
            quizTitle: scoreData.quizTitle || `Quiz ${quizId}`, 
            score: scoreData.score,
            totalQuestions: scoreData.totalQuestions,
            timestamp: scoreData.timestamp,
          }));
          setScores(scoreArray);
          setError(null);
          console.log('Scores loaded:', scoreArray);
        } else {
          setError('No scores found');
          console.log('No score data found for user:', user.uid);
        }
      },
      (error) => {
        setError('Failed to fetch scores: ' + error.message);
        console.error('Firebase error:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleBack = () => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-xl text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200"
            onClick={handleBack}
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">Your Quiz Score Summary</h1>
          <button
            onClick={handleBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
            Back to Quiz List
          </button>
        </div>
        {scores.length === 0 ? (
          <div className="bg-white shadow-xl rounded-lg p-8 text-center">
            <p className="text-gray-700 text-lg">You haven’t taken any quizzes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scores.map((score) => (
              <div
                key={score.quizId}
                className="bg-white shadow-xl rounded-lg p-6 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:bg-blue-50"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{score.quizTitle}</h2>
                <p className="text-gray-600 mb-2">
                  Maximum Score: {score.score} / {score.totalQuestions}
                </p>
                <p className="text-sm text-gray-500">
                  Last Attempt: {new Date(score.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreSummary;