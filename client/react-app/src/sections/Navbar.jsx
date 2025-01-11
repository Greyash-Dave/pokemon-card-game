// Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Navbar.css';

function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="navbar-items">
      <div><Link to="/">Home</Link></div>
      <div><Link to="/deck-builder">Deck Builder</Link></div>
      <div><Link to="/game-menu">Menu</Link></div>
      {isLoggedIn ? (
        <>
          <div><Link to="/dashboard">Dashboard</Link></div>
          <div><button className='log-btn' onClick={handleLogout}>Logout</button></div>
        </>
      ) : (
        <div><Link to="/login">Login</Link></div>
      )}
    </div>
  );
}

export default Navbar;