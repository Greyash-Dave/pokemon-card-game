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
  if (process.env.NODE_ENV === 'production'|| import.meta.env.NODE_ENV === 'production') {
    var API_URL = import.meta.env.VITE_API_URL;
  }else{
    var API_URL = 'http://localhost:5000'
  }
  
  console.log('Current API URL:', API_URL);

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
            body: JSON.stringify({ 
                username, 
                password 
            }),
            credentials: 'include'
        });

        // Log the full response for debugging
        console.log('Full response:', response);
        
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to login');
        }

        setUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginTimestamp', Date.now().toString());
        navigate('/dashboard');
        
    } catch (error) {
        console.error('Login error:', {
            error,
            message: error.message,
            stack: error.stack
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