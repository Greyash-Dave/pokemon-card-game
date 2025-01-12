import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setIsLoggedIn } = useAuth();

  // Simplified API URL determination
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  console.log('Current API URL:', API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // Log the request details (for debugging)
      console.log('Sending request to:', `${API_URL}/login`);
      console.log('Request payload:', { username });

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
        mode: 'cors'
      });

      // Log response status and headers (for debugging)
      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      // Successfully logged in
      setUser(data.user);
      setIsLoggedIn(true);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('loginTimestamp', Date.now().toString());
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      setMessage(error.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSessionTimeout = () => {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    if (loginTimestamp) {
      const timeElapsed = Date.now() - parseInt(loginTimestamp);
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      
      if (timeElapsed > sessionTimeout) {
        localStorage.removeItem('user');
        localStorage.removeItem('loginTimestamp');
        setUser(null);
        setIsLoggedIn(false);
        setMessage('Session expired. Please login again.');
      }
    }
  };

  React.useEffect(() => {
    checkSessionTimeout();
  }, []);

  return (
    <div className="login-bg">
      <div className="game-login">
        <h1>Player Login</h1>
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Player Name:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button 
            type="submit" 
            className="login-button" 
            disabled={isLoading || !username || !password}
          >
            {isLoading ? 'Logging in...' : 'Enter Game'}
          </button>
        </form>
        <p className="register-link">
          New player? <a href="/register">Create your Account</a>
        </p>
      </div>
    </div>
  );
}

export default Login;