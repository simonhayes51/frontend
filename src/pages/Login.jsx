// src/pages/Login.jsx
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';

const Login = () => {
  const { isAuthenticated, login, checkAuthStatus } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('authenticated') === 'true') {
      checkAuthStatus();
    }
  }, [searchParams, checkAuthStatus]);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white flex items-center justify-center">
      <div className="text-center bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-8">
        <h1 className="text-4xl font-bold mb-8">FUT Trading Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Track your FIFA Ultimate Team trades and profits
        </p>
        <button
          onClick={login}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Login with Discord
        </button>
      </div>
    </div>
  );
};

export default Login;
