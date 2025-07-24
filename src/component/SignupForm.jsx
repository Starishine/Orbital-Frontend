import { useState } from 'react';
import axios from 'axios';
import React from 'react';

export default function SignupForm({ onSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // Match theme with SignInForm
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const theme = {
        cardBg: darkMode ? '#2e3a59' : '#fff',
        textColor: darkMode ? '#e3f2fd' : '#222',
        primary: darkMode ? '#90caf9' : '#1976d2',
        accent: '#90caf9',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
        danger: '#d32f2f',
        inputBg: darkMode ? '#1e2746' : '#f5f5f5'
    };

    const handleSignup = () => {
        setError('');
        if (!username) return setError('Please enter a username');
        if (!email) return setError('Please enter your email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Please enter a valid email address.');
        if (!password) return setError('Please enter a password');
        if (!confirmPassword) return setError('Please confirm your password');
        if (password !== confirmPassword) return setError('Passwords do not match');

        axios.post('/api/signup/register', {
            username,
            password,
            email
        })
            .then((response) => {
                const data = response.data;
                if (data.status === "SUCCESS" && data.code === 200) {
                    setError('');
                    onSuccess(data.data);
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
            });
    };

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                handleSignup();
            }}
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
                <label htmlFor="signup-username" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: theme.primary
                }}>
                    Username
                </label>
                <input
                    id="signup-username"
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
                <label htmlFor="signup-email" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: theme.primary
                }}>
                    Email
                </label>
                <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                    autoComplete="email"
                />
            </div>
            <div style={{ marginBottom: '18px' }}>
                <label htmlFor="signup-password" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: theme.primary
                }}>
                    Password
                </label>
                <input
                    id="signup-password"
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
                    autoComplete="new-password"
                />
            </div>
            <div style={{ marginBottom: '18px' }}>
                <label htmlFor="signup-confirm-password" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 600,
                    color: theme.primary
                }}>
                    Confirm Password
                </label>
                <input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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
                    autoComplete="new-password"
                />
            </div>
            <button
                type="submit"
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
                Sign Up
            </button>
            {error && (
                <p style={{ color: theme.danger, marginTop: '16px', textAlign: 'center' }}>{error}</p>
            )}
            <p style={{ marginTop: '16px', textAlign: 'center', color: theme.textColor }}>
                Already have an account?{' '}
                <span
                    style={{ color: theme.primary, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => window.location.href = '/'}
                >
                    Sign In
                </span>
            </p>
        </form>
    );
}
