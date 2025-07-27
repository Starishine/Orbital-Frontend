import React, { useState, useEffect } from 'react';
import CreateSharedBudgetForm from '../component/CreateSharedBudgetForm';
import SharedBudgetDetail from '../component/SharedBudgetDetail';
import { Link, useNavigate } from "react-router-dom";

export default function SharedBudget() {
    const [selectedBudgetId, setSelectedBudgetId] = useState('');
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    // Theme colors for consistency with dashboard and exchange
    const [themeColors, setThemeColors] = useState({
        cardBg: darkMode ? '#2e3a59' : '#fff',
        textColor: darkMode ? '#e3f2fd' : '#222',
        primary: darkMode ? '#90caf9' : '#1976d2',
        fontColor: darkMode ? '#e3f2fd' : '#222'
    });

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
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const { cardBg, textColor, primary, fontColor } = themeColors;

    return (
        <>
            {/* Navigation bar - matches Dashboard/Exchange/Expenses */}
            <nav style={{
                marginBottom: '24px',
                zoom: '80%',
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
            {/* Main content area - consistent with other pages */}
            <div style={{
                padding: '32px',
                fontFamily: 'Inter, Arial, sans-serif',
                background: 'none',
                zoom: '80%',
                color: fontColor,
                minHeight: '100vh',
                maxWidth: '1400px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }}>
                <h1 style={{
                    fontWeight: 800,
                    fontSize: 36,
                    marginBottom: 8,
                    color: primary,
                    textAlign: 'left'
                }}>Shared Budgets</h1>
                <p style={{
                    fontSize: 18,
                    color: fontColor,
                    marginBottom: 32,
                    textAlign: 'left'
                }}>Create and manage your shared budgets below.</p>
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 40,
                    justifyContent: 'center',
                    maxWidth: 1200,
                    margin: '0 auto'
                }}>
                    <div style={{
                        width: '510px',
                        background: cardBg,
                        borderRadius: '18px',
                        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                        padding: '32px',
                        color: fontColor
                    }}>
                        <CreateSharedBudgetForm />
                    </div>
                    <div style={{
                        width: '550px',
                        background: cardBg,
                        borderRadius: '18px',
                        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                        padding: '32px',
                        color: fontColor
                    }}>
                        <SharedBudgetDetail
                            selectedBudgetId={selectedBudgetId}
                            setSelectedBudgetId={setSelectedBudgetId}
                        />
                    </div>
                </div>
                {/* Dark mode toggle button - same as other pages */}
                <button
                    onClick={() => setDarkMode(dm => !dm)}
                    style={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        background: primary,
                        color: darkMode ? '#263859' : '#fff',
                        border: 'none',
                        borderRadius: 24,
                        padding: '14px 32px',
                        fontWeight: 700,
                        fontSize: 18,
                        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                        cursor: 'pointer',
                        zIndex: 1000,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = darkMode ? '#1e2746' : '#115293'}
                    onMouseOut={e => e.currentTarget.style.background = primary}
                >
                    {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
            </div>
        </>
    );
}