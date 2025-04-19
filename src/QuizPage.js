import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { database, analytics, auth } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import { logEvent } from 'firebase/analytics';

// Import audio files
import clickSound from './assets/sounds/click.mp3';
import clapSound from './assets/sounds/clap.wav';
import ohSound from './assets/sounds/oh.wav';

// QuizPage component
// This component handles the quiz functionality, including fetching quiz data, displaying questions, and handling user interactions.

function QuizPage() {
  const [quizData, setQuizData] = useState(null); 
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { quizId } = useParams();

  // Memoize audio objects
  const clickAudio = useMemo(() => new Audio(clickSound), []);
  const clapAudio = useMemo(() => new Audio(clapSound), []);
  const ohAudio = useMemo(() => new Audio(ohSound), []);

  useEffect(() => {
    console.log('Fetching quiz with ID:', quizId);
    const quizRef = ref(database, `quizzes/${quizId}`);
    const unsubscribe = onValue(
      quizRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && data.questions) {
          setQuizData(data); 
          setError(null);
          console.log('Quiz data loaded:', data);
          logEvent(analytics, 'quiz_start', { quiz_id: quizId, quiz_title: data.title });
        } else {
          setError('Quiz not found');
          console.error(`No data found at quizzes/${quizId}`);
        }
      },
      (error) => {
        setError('Failed to fetch quiz: ' + error.message);
        console.error('Firebase error:', error);
      }
    );
    return () => unsubscribe();
  }, [quizId]);

  const sendResultToBackend = useCallback(async (finalScore, quizTitle) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const scoreRef = ref(database, `scores/${user.uid}/${quizId}`);
      await set(scoreRef, {
        score: finalScore,
        totalQuestions: quizData.questions.length, 
        quizTitle: quizTitle || 'Unknown Quiz',
        timestamp: new Date().toISOString(),
      });
      console.log('Score saved to Firebase for user:', user.uid);
      logEvent(analytics, 'quiz_complete', {
        quiz_id: quizId,
        score: finalScore,
        total_questions: quizData.questions.length,
      });
      // Play sound based on score percentage
      const scorePercentage = finalScore / quizData.questions.length;
      if (scorePercentage > 0.5) {
        clapAudio.play().catch((err) => console.error('Clap audio error:', err));
      } else {
        ohAudio.play().catch((err) => console.error('Oh audio error:', err));
      }
    } catch (error) {
      console.error('Failed to save score:', error);
      setError('Failed to save score. Please try again.');
    }
  }, [quizId, quizData, clapAudio, ohAudio]);

  const handleNext = useCallback(() => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    const isCorrect = selectedOption === quizData.questions[currentQuestion].correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    logEvent(analytics, 'answer_question', {
      quiz_id: quizId,
      question_number: currentQuestion + 1,
      is_correct: isCorrect,
    });

    setSelectedOption('');
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTimer(30);
    } else {
      setShowResult(true);
      const finalScore = score + (isCorrect ? 1 : 0);
      sendResultToBackend(finalScore, quizData.title); 
    }
  }, [quizId, currentQuestion, selectedOption, score, quizData, sendResultToBackend, clickAudio]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          handleNext();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion, handleNext]);

  useEffect(() => {
    logEvent(analytics, 'screen_view', {
      screen_name: `quiz_${quizId}`,
      screen_class: 'QuizPage',
    });
  }, [quizId]);

  const handleOptionClick = useCallback((option) => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    setSelectedOption(option);
    logEvent(analytics, 'select_option', {
      quiz_id: quizId,
      question_number: currentQuestion + 1,
      option_selected: option,
    });
  }, [quizId, currentQuestion, clickAudio]);

  const handleTryAgain = () => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    setCurrentQuestion(0);
    setSelectedOption('');
    setScore(0);
    setTimer(30);
    setShowResult(false);
    logEvent(analytics, 'quiz_retry', { quiz_id: quizId });
  };

  const handleBackToQuizList = () => {
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
            onClick={handleBackToQuizList}
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="text-gray-700 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-xl transition-all duration-300 ease-in-out">
        {showResult ? (
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-green-600 mb-4">Your Score</h2>
            <p className="text-xl font-semibold text-gray-700">{score} out of {quizData.questions.length}</p>
            <button
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              onClick={handleTryAgain}
            >
              <span className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
              Try Again
            </button>
            <button
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              onClick={handleBackToQuizList}
            >
              <span className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
              Back to Quiz List
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Time Left: <span className="text-red-500 font-bold">{timer}s</span>
              </span>
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {quizData.questions.length}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6 animate-fade-in">
              {quizData.questions[currentQuestion].question}
            </h2>
            <div className="space-y-3">
              {quizData.questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full py-3 px-4 text-left border rounded-lg transition-all duration-200 transform ${
                    selectedOption === option
                      ? 'bg-blue-500 text-white border-blue-600 shadow-glow'
                      : 'bg-gray-50 hover:bg-gray-100 hover:scale-102 active:scale-98 border-gray-300'
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
              onClick={handleNext}
            >
              <span className="absolute inset-0 bg-green-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
              {currentQuestion === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default QuizPage;