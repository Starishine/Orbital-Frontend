import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import CurrencyDropdown from '../component/CurrencyDropdown';
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [username, setUsername] = useState(localStorage.getItem('username') || 'User');
    const [email, setEmail] = useState(localStorage.getItem('email') || 'No email provided');
    const [homeCurrency, setHomeCurrency] = useState(localStorage.getItem('homeCurrency') || 'SGD');
    const navigate = useNavigate();

    // Theme colors for consistency with dashboard/expenses/exchange
    const [themeColors, setThemeColors] = useState({
        cardBg: darkMode ? '#2e3a59' : '#fff',
        textColor: darkMode ? '#e3f2fd' : '#222',
        primary: darkMode ? '#90caf9' : '#1976d2',
        fontColor: darkMode ? '#e3f2fd' : '#222'
    });

    useEffect(() => {
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
            setUsername('Guest');
            setEmail('guest@example.com');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('convertedExpenses');
        localStorage.removeItem('homeCurrency');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('lastReadNotifHash');
        navigate('/');
        window.location.reload();
    };

    const { cardBg, textColor, primary, fontColor } = themeColors;

    return (
        <>
            {/* Navigation bar - matches Dashboard/Expenses/Exchange */}
            <nav style={{
                marginBottom: '24px',
                display: 'flex',
                gap: '24px',
                background: darkMode
                    ? 'linear-gradient(90deg,#263859 0%,#1e2746 100%)'
                    : 'linear-gradient(90deg,#1976d2 0%,#42a5f5 100%)',
                color: fontColor,
                padding: '14px 40px',
                borderRadius: '18px',
                boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                alignItems: 'center',
                minWidth: 0,
                width: 'calc(100% - 80px)',
                maxWidth: '1400px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <Link to="/dashboard" style={{ color: darkMode ? primary : '#115293', fontWeight: 600, fontSize: 18 }}>Dashboard</Link>
                <Link to="/exchange" style={{ color: darkMode ? primary : '#115293', fontWeight: 600, fontSize: 18 }}>Exchange</Link>
                <Link to="/expenses" style={{ color: darkMode ? primary : '#115293', fontWeight: 600, fontSize: 18 }}>Expenses</Link>
                <Link to="/visualisation" style={{ color: darkMode ? primary : '#115293', fontWeight: 600, fontSize: 18 }}>Visualisation</Link>
                <Link to="/shared-budget" style={{ color: darkMode ? primary : '#115293', fontWeight: 600, fontSize: 18 }}>Shared Budget</Link>
                <Link to="/profile" style={{ color: darkMode ? primary : '#115293', fontWeight: 600, fontSize: 18 }}>Profile</Link>

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
            {/* Main content area - centered and consistent with other pages */}
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                color: fontColor,
                fontFamily: 'Inter, Arial, sans-serif'
            }}>
                <div style={{
                    background: cardBg,
                    color: fontColor,
                    borderRadius: 18,
                    boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                    padding: '40px 48px',
                    maxWidth: 420,
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: primary,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 36,
                        fontWeight: 700,
                        margin: '0 auto 24px auto',
                        letterSpacing: 2,
                    }}>
                        {username ? username[0].toUpperCase() : 'U'}
                    </div>
                    <h2 style={{
                        margin: '0 0 12px 0',
                        fontWeight: 800,
                        fontSize: 28,
                        color: primary
                    }}>User Profile</h2>
                    <div style={{ marginBottom: 16 }}>
                        <span style={{ fontWeight: 600, color: primary }}>Username:</span>
                        <span style={{ marginLeft: 8 }}>{username}</span>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <span style={{ fontWeight: 600, color: primary }}>Email:</span>
                        <span style={{ marginLeft: 8 }}>{email}</span>
                    </div>
                    <div style={{ marginBottom: 24, color: primary, fontWeight: 600 }}>
                        Select Home Currency:
                        <div style={{ marginTop: 8 }}>
                            <CurrencyDropdown currency={homeCurrency} setCurrency={setHomeCurrency} />
                            {localStorage.setItem('homeCurrency', homeCurrency)}
                        </div>
                    </div>
                    <button
                        onClick={() => setDarkMode(dm => !dm)}
                        style={{
                            marginTop: 16,
                            background: primary,
                            color: darkMode ? '#263859' : '#fff',
                            border: 'none',
                            borderRadius: 24,
                            padding: '12px 28px',
                            fontWeight: 700,
                            fontSize: 16,
                            boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = darkMode ? '#1e2746' : '#115293'}
                        onMouseOut={e => e.currentTarget.style.background = primary}
                    >
                        {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                </div>
            </div>
        </>
    );
}