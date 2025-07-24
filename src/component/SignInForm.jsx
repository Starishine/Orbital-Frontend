import { useState, useEffect } from 'react';
import axios from 'axios';
import React from 'react';

export default function SignInForm({ onSuccess, onSwitchToSignUp, darkMode, setDarkMode }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Theme for consistency
    const theme = {
        cardBg: darkMode ? '#2e3a59' : '#fff',
        textColor: darkMode ? '#e3f2fd' : '#222',
        primary: darkMode ? '#90caf9' : '#1976d2',
        accent: '#90caf9',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
        danger: '#d32f2f',
        inputBg: darkMode ? '#1e2746' : '#f5f5f5'
    };

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const handleSignIn = () => {
        setError('');
        if (!username) return setError('Please enter your username');
        if (!password) return setError('Please enter your password');

        axios.post('/api/signup/login', {
            username: username,
            password: password
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(res => {
                const data = res.data;
                if (data.status === "SUCCESS" && data.code === 200) {
                    onSuccess(data.data, data.token);
                } else {
                    setError(data.message);
                }
            })
            .catch((error) => {
                if (error.response && error.response.data) {
                    setError(error.response.data);
                } else {
                    setError('An error occurred. Please try again.');
                }
            })
    };

    return (
        <form
            onSubmit={e => { e.preventDefault(); handleSignIn(); }}
            style={{
                width: '100%',
                maxWidth: 350,
                margin: '0 auto',
                padding: 0,
                border: 'none',
                borderRadius: 0,
                background: 'none',
                boxShadow: 'none',
                color: theme.textColor,
                fontFamily: 'Inter, Arial, sans-serif'
            }}
        >
            <div style={{ marginBottom: '18px' }}>
                <label htmlFor="username" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: theme.primary
                }}>Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1px solid ${theme.accent}`,
                        background: theme.inputBg,
                        color: theme.textColor,
                        fontSize: 16,
                        outline: 'none'
                    }}
                    autoComplete="username"
                />
            </div>
            <div style={{ marginBottom: '18px' }}>
                <label htmlFor="password" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: theme.primary
                }}>Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1px solid ${theme.accent}`,
                        background: theme.inputBg,
                        color: theme.textColor,
                        fontSize: 16,
                        outline: 'none'
                    }}
                    autoComplete="current-password"
                />
            </div>
            <button type="submit"
                style={{
                    width: '100%',
                    padding: '12px 24px',
                    background: theme.primary,
                    color: theme.cardBg,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: theme.shadow,
                    transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = theme.accent}
                onMouseOut={e => e.currentTarget.style.background = theme.primary}
            >
                Sign In
            </button>
            {error && <p style={{ color: theme.danger, marginTop: '16px', textAlign: 'center' }}>{error}</p>}
            <p style={{ marginTop: '16px', textAlign: 'center', color: theme.textColor }}>
                Don't have an account?{' '}
                <span
                    style={{ color: theme.primary, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={onSwitchToSignUp}
                >
                    Sign Up
                </span>
            </p>
        </form>
    );
}