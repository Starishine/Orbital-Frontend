import CurrencyExchange from '../component/CurrencyExchange';
import Notifications from '../component/Notifications';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import React from "react";

export default function Exchange() {
  const navigate = useNavigate();
  const [username, setUserName] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [themeColors, setThemeColors] = useState({
    cardBg: darkMode ? '#2e3a59' : '#fff',
    textColor: darkMode ? '#e3f2fd' : '#222',
    primary: darkMode ? '#90caf9' : '#1976d2',
    fontColor: darkMode ? '#e3f2fd' : '#222'
  });

  useEffect(() => {
    // changed: sync theme with dashboard
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.background = 'linear-gradient(135deg,#263859 0%,#1e2746 100%)';
      document.body.style.setProperty('--card-bg', '#2e3a59');
      document.body.style.setProperty('--text-color', '#e3f2fd');
      document.body.style.setProperty('--primary', '#90caf9');
      document.body.style.setProperty('--font-color', '#e3f2fd');
      setThemeColors({
        cardBg: '#2e3a59',
        textColor: '#e3f2fd',
        primary: '#90caf9',
        fontColor: '#e3f2fd'
      });
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.background = 'linear-gradient(135deg,#e3f2fd 0%,#90caf9 100%)';
      document.body.style.setProperty('--card-bg', '#fff');
      document.body.style.setProperty('--text-color', '#222');
      document.body.style.setProperty('--primary', '#1976d2');
      document.body.style.setProperty('--font-color', '#222');
      setThemeColors({
        cardBg: '#fff',
        textColor: '#222',
        primary: '#1976d2',
        fontColor: '#222'
      });
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/'); // Redirect to login/signin page if token is missing
    }
    else {
      const decoded = jwtDecode(token);
      setUserName(decoded.sub); // Extract username from token
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('convertedExpenses');
    localStorage.removeItem('homeCurrency');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('lastReadNotifHash');
    navigate('/'); // Redirect to the home page
  };

  const { cardBg, textColor, primary, fontColor } = themeColors;

  return (
    <>
      {/* changed: navigation bar matches dashboard */}
      <nav style={{
        marginBottom: '24px',
        display: 'flex',
        gap: '16px',
        background: darkMode
          ? 'linear-gradient(90deg,#263859 0%,#1e2746 100%)'
          : 'linear-gradient(90deg,#1976d2 0%,#42a5f5 100%)',
        color: fontColor,
        padding: '14px 28px',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
        alignItems: 'center'
      }}>
        <Link to="/dashboard" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Dashboard</Link>
        <Link to="/exchange" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Exchange</Link>
        <Link to="/expenses" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Expenses</Link>
        <Link to="/visualisation" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Visualisation</Link>
        <Link to="/shared-budget" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Shared Budget</Link>
        <Link to="/profile" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Profile</Link>
        <Notifications />
        <button
          onClick={handleLogout}
          style={{
            marginLeft: 'auto',
            background: primary,
            color: darkMode ? '#263859' : '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 20px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = darkMode ? '#1e2746' : '#115293'}
          onMouseOut={e => e.currentTarget.style.background = primary}
        >
          Logout
        </button>
      </nav>
      {/* changed: page background and font color consistent with dashboard */}
      <div style={{
        padding: '32px',
        fontFamily: 'Inter, Arial, sans-serif',
        background: 'none',
        color: fontColor,
        minHeight: '100vh'
      }}>
        <h1 style={{
          fontWeight: 800,
          fontSize: 36,
          marginBottom: 8,
          color: primary
        }}>Welcome, {username}</h1>
        <p style={{
          fontSize: 18,
          color: fontColor,
          marginBottom: 32
        }}>Use the currency exchange tool below!</p>
        {/* changed: CurrencyExchange card is centered and matches dashboard */}
        <div style={{
          maxWidth: 600,
          margin: '0 auto',
          background: cardBg,
          borderRadius: '18px',
          boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
          padding: '32px',
          color: fontColor
        }}>
          <CurrencyExchange />
        </div>
      </div>
    </>
  );
}