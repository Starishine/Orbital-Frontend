import { useLocation, Link, useNavigate } from "react-router-dom";
import AddBudgetForm from "../component/AddBudgetForm";
import { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import ExistingBudget from "../component/ExistingBudget";
import BudgetBannerManager from "../component/BudgetBannerManager";
import axios from "axios";
import React from "react";
import EmailInvite from "../component/EmailInvite";


export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUserName] = useState(false);
    const [email, setEmail] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [banner, setBanner] = useState([]);
    const [bannerIdx, setBannerIdx] = useState(0);
    const [bannerDismissed, setBannerDismissed] = useState(
        sessionStorage.getItem('bannerDismissed') === 'true'
    );

    // Use state for theme colors so they update instantly
    const [themeColors, setThemeColors] = useState({
        cardBg: darkMode ? '#2e3a59' : '#fff',
        textColor: darkMode ? '#e3f2fd' : '#222',
        primary: darkMode ? '#90caf9' : '#1976d2',
        fontColor: darkMode ? '#e3f2fd' : '#222'
    });

    useEffect(() => {
        // Apply dark mode theme to body and set CSS variables for theme
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

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('convertedExpenses')
        localStorage.removeItem('homeCurrency')
        localStorage.removeItem('username')
        localStorage.removeItem('email')
        localStorage.removeItem('lastReadNotifHash');
        sessionStorage.removeItem('bannerDismissed');
        navigate('/'); // Redirect to the home page
        window.location.reload();
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redirect to login/signin page if token is missing
        }
        else {
            const decoded = jwtDecode(token);
            setUserName(decoded.sub); // Extract username from token
            axios.get(`/api/signup/get`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    const filteredUser = response.data.find(user => user.username === (decoded.sub || 'User'));
                    if (filteredUser) {
                        setEmail(filteredUser.email || 'No email provided'); // Set email from the user data
                        localStorage.setItem('username', filteredUser.username); // Set after getting value
                        localStorage.setItem('email', filteredUser.email || 'No email provided');
                    } else {
                        setEmail('User not found');
                    }
                })
                .catch(error => {
                    setEmail('Error fetching email');
                });
        }
    }, [navigate]);

    // Use themeColors from state instead of getComputedStyle
    const { cardBg, textColor, primary, fontColor } = themeColors;

    return (
        <>
            <nav style={{
                marginBottom: '24px',
                zoom: '80%',
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
                {/* changed: darker blue font for nav links in light mode */}
                <Link to="/dashboard" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Dashboard</Link>
                <Link to="/exchange" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Exchange</Link>
                <Link to="/expenses" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Expenses</Link>
                <Link to="/visualisation" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Visualisation</Link>
                <Link to="/shared-budget" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Shared Budget</Link>
                <Link to="/profile" style={{ color: darkMode ? primary : '#115293', fontWeight: 600 }}>Profile</Link>
                <BudgetBannerManager banner={banner} setBanner={setBanner} bannerDismissed={bannerDismissed} setBannerDismissed={setBannerDismissed} />
                <EmailInvite />
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
            <div style={{
                padding: '32px',
                fontFamily: 'Inter, Arial, sans-serif',
                background: 'none',
                zoom: '80%',
                color: fontColor,
                minHeight: '100vh'
            }}>
                <h1 style={{
                    fontWeight: 800,
                    fontSize: 36,
                    marginBottom: 8,
                    color: primary
                }}>Welcome, {username} </h1>
                <p style={{
                    fontSize: 18,
                    color: fontColor,
                    marginBottom: 32
                }}>Welcome to your dashboard! Here you can set your budget!!</p>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40 }}>
                    <div style={{
                        width: '500px',
                        background: cardBg,
                        borderRadius: '18px',
                        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                        padding: '32px',
                        color: fontColor
                    }}>
                        <AddBudgetForm />
                    </div>
                    <div style={{
                        flex: 1,
                        background: cardBg,
                        borderRadius: '18px',
                        boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                        padding: '32px',
                        color: fontColor
                    }}>
                        <h2 style={{ marginBottom: '20px', color: primary, fontWeight: 800, fontSize: 24, letterSpacing: 1 }}>Active Budgets (Set in home currency)</h2>
                        <ExistingBudget />
                    </div>
                </div>
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