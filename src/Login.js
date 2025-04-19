import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import clickSound from './assets/sounds/click.mp3';

// Login component
// This component handles user login using email/password or Google authentication

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const clickAudio = new Audio(clickSound);

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    console.log('Email:', email, 'Password:', password, 'Remember Me:', rememberMe);
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/');
    } catch (err) {
      let errorMessage = 'An error occurred during login';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts, please try again later';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Email login error:', err);
    }
  };

  const handleGoogleLogin = async () => {
    clickAudio.play().catch((err) => console.error('Click audio error:', err));
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', userEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      navigate('/');
    } catch (err) {
      let errorMessage = 'Google login failed';
      switch (err.code) {
        case 'auth/operation-not-allowed':
          errorMessage = 'Google login is not enabled';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Google login was cancelled';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Google login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Login to QuizMaster</h2>
        {error && (
          <p className="text-red-600 text-center mb-4">{error}</p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-gray-700 text-sm">
              Remember Me
            </label>
          </div>
          <button
            onClick={handleEmailLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
            Login with Email
          </button>
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 relative overflow-hidden group"
          >
            <span className="absolute inset-0 bg-red-800 opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
            Login with Google
          </button>
        </div>
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;