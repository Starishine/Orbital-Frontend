import { useLocation, Link, useNavigate } from "react-router-dom";
import AddBudgetForm from "../component/AddBudgetForm";
import { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import ExistingBudget from "../component/ExistingBudget";
import Notifications from "../component/Notifications";
import axios from "axios";
import React from "react";

export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUserName] = useState(false);
    const [email, setEmail] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
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
        navigate('/'); // Redirect to the home page
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redirect to login/signin page if token is missing
        }
        else {
            const decoded = jwtDecode(token);
            setUserName(decoded.sub); // Extract username from token
            axios.get(`http://localhost:8080/signup/get`, {
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

    return (
        <>
            <nav style={{
                marginBottom: '24px',
                display: 'flex',
                gap: '16px',
                background: 'var(--card)',
                color: 'var(--text)',
                padding: '12px 24px',
                borderRadius: 'var(--round-md)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
            }}>
                <Link to="/dashboard" style={{ color: 'var(--primary)' }}>Dashboard</Link>
                <Link to="/exchange" style={{ color: 'var(--primary)' }}>Exchange</Link>
                <Link to="/expenses" style={{ color: 'var(--primary)' }}>Expenses</Link>
                <Link to="/visualisation" style={{ color: 'var(--primary)' }}>Visualisation</Link>
                <Link to="/shared-budget" style={{ color: 'var(--primary)' }}>Shared Budget</Link>
                <Link to="/profile" style={{ color: 'var(--primary)' }}>Profile</Link>
                <Notifications />
                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: 'auto',
                        background: 'var(--primary)',
                        color: 'var(--card)',
                        border: 'none',
                        borderRadius: 'var(--round-sm)',
                        padding: '6px 16px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </nav>
            <div style={{
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                background: 'var(--bg)',
                color: 'var(--text)',
                minHeight: '100vh'
            }}>
                <h1>Welcome, {username} </h1>
                <p>Welcome to your dashboard! Here you can set your budget!!</p>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{
                        marginRight: '40px',
                        width: '500px',
                        background: 'var(--card)',
                        borderRadius: 'var(--round-md)',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                        padding: '24px'
                    }}>
                        <AddBudgetForm />
                    </div>
                    <div style={{
                        flex: 1,
                        background: 'var(--card)',
                        borderRadius: 'var(--round-md)',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                        padding: '24px'
                    }}>
                        <ExistingBudget />
                    </div>
                </div>
                <button
                    onClick={() => setDarkMode(dm => !dm)}
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        background: 'var(--primary)',
                        color: 'var(--card)',
                        border: 'none',
                        borderRadius: 24,
                        padding: '12px 28px',
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        zIndex: 1000
                    }}
                >
                    {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
                </button>
            </div>
        </>
    );
}