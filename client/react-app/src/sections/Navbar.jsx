// Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/" className="logo">GameDeck</Link>
        </div>

        <button 
          className={`mobile-menu-button ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-items ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActiveRoute('/') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/deck-builder" 
            className={`nav-link ${isActiveRoute('/deck-builder') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Deck Builder
          </Link>
          <Link 
            to="/game-menu" 
            className={`nav-link ${isActiveRoute('/game-menu') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Menu
          </Link>
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button className="log-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className={`nav-link ${isActiveRoute('/login') ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;