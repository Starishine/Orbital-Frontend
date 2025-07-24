import { useState, useEffect } from 'react';
import SignupForm from '../component/SignupForm';
import SignInForm from '../component/SignInForm';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/money-tree-logo.jpg';
import React from 'react';

export default function MainApp() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();

  // Theme colors for consistency
  const theme = {
    cardBg: darkMode ? '#2e3a59' : '#fff',
    textColor: darkMode ? '#e3f2fd' : '#222',
    primary: darkMode ? '#90caf9' : '#1976d2',
    accent: '#90caf9',
    shadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.background = 'linear-gradient(135deg,#263859 0%,#1e2746 100%)';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.background = 'linear-gradient(135deg,#e3f2fd 0%,#90caf9 100%)';
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleAuthSuccess = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('currency', 'SGD');
    navigate('/dashboard');
  };

  const handleSignupSuccess = (user) => {
    alert(`Signup Successful! Please log in, ${user.username}`);
    setShowSignUp(false);
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        fontFamily: 'Inter, Arial, sans-serif',
        color: theme.textColor,
      }}
    >
      <div
        style={{
          background: theme.cardBg,
          borderRadius: 18,
          boxShadow: theme.shadow,
          padding: '40px 36px 32px 36px',
          maxWidth: 400,
          width: '150%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: `1px solid ${theme.accent}`,
        }}
      >
        <img
          src={logo}
          alt="Money Tree"
          style={{
            maxWidth: '120px',
            marginBottom: '12px',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
          }}
        />
        <h1 style={{
          color: theme.primary,
          fontWeight: 900,
          fontSize: 32,
          marginBottom: 0,
          letterSpacing: 1,
        }}>
          BudgetBuddy
        </h1>
        <div style={{
          fontSize: '1.1rem',
          color: theme.textColor,
          fontWeight: 400,
          marginTop: '-4px',
          marginBottom: '24px',
          letterSpacing: '0.5px',
          fontStyle: 'italic',
        }}>
          Your university finance planner
        </div>
        <h2 style={{
          fontSize: 22,
          color: theme.primary,
          fontWeight: 700,
          marginBottom: 18,
          marginTop: 0,
          letterSpacing: 0.5,
        }}>
          {showSignUp ? 'Sign Up' : 'Sign In'}
        </h2>
        <div style={{ width: '100%' }}>
          {showSignUp ? (
            <SignupForm onSuccess={handleSignupSuccess} />
          ) : (
            <SignInForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => setShowSignUp(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          )}
        </div>
        <button
          onClick={() => setDarkMode(dm => !dm)}
          style={{
            marginTop: 24,
            background: theme.primary,
            color: darkMode ? '#263859' : '#fff',
            border: 'none',
            borderRadius: 24,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: 16,
            boxShadow: theme.shadow,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = darkMode ? '#1e2746' : '#115293'}
          onMouseOut={e => e.currentTarget.style.background = theme.primary}
        >
          {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
    </div>
  );
}