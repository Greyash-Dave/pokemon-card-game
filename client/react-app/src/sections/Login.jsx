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

  // Use Vite's environment variable syntax
  if (import.meta.env.NODE_ENV === 'production') { 
    var API_URL = import.meta.env.VITE_API_URL;
  }else{
    var API_URL = 'http://localhost:5000'
  }
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError("Expected JSON response but got " + contentType);
      }

      const data = await response.json();

      setMessage('Login successful');
      console.log('Login successful:', data.user);
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsLoggedIn(true);
      
      // Add timestamp for session tracking
      localStorage.setItem('loginTimestamp', Date.now().toString());
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message === 'Failed to fetch' 
        ? 'Error connecting to server. Please try again.'
        : 'Invalid username or password');
      
      // Clear auth data on error
      localStorage.removeItem('user');
      localStorage.removeItem('loginTimestamp');
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Add session timeout check
  const checkSessionTimeout = () => {
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    if (loginTimestamp) {
      const timeElapsed = Date.now() - parseInt(loginTimestamp);
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      
      if (timeElapsed > sessionTimeout) {
        // Session expired
        localStorage.removeItem('user');
        localStorage.removeItem('loginTimestamp');
        setUser(null);
        setIsLoggedIn(false);
        navigate('/login');
      }
    }
  };

  // Check session on component mount
  React.useEffect(() => {
    checkSessionTimeout();
  }, []);

  return (
    <div className="login-bg">
      <div className="game-login">
        <h1>Player Login</h1>
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
        {message && (
          <p className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
        <p className="register-link">
          New player? <a href="/register">Create your Account</a>
        </p>
      </div>
    </div>
  );
}

export default Login;