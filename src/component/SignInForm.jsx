import { useState, useEffect } from 'react';
import axios from 'axios';
import React from 'react';

export default function SignInForm({ onSuccess, onSwitchToSignUp }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

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
        <>
            <form
                onSubmit={e => { e.preventDefault(); handleSignIn(); }}
                style={{
                    maxWidth: '350px',
                    margin: '0 auto',
                    padding: '24px',
                    border: '1px solid var(--light)',
                    borderRadius: '8px',
                    background: 'var(--card)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    color: 'var(--text)'
                }}
            >
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="username" style={{ flex: '0 0 130px', marginRight: '10px', fontWeight: 500, color: 'var(--text)' }}>Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid var(--primary)',
                            borderRadius: '4px',
                            background: 'var(--bg)',
                            color: 'var(--text)'
                        }}
                        autoComplete="username"
                    />
                </div>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="password" style={{ flex: '0 0 130px', marginRight: '10px', fontWeight: 500, color: 'var(--text)' }}>Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px',
                            border: '1px solid var(--primary)',
                            borderRadius: '4px',
                            background: 'var(--bg)',
                            color: 'var(--text)'
                        }}
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit"
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'var(--primary)',
                        color: 'var(--card)',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}>
                    Sign In
                </button>
                {error && <p style={{ color: 'var(--danger)', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
                <p style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text)' }}>
                    Don't have an account?{' '}
                    <span
                        style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={onSwitchToSignUp}
                    >
                        Sign Up
                    </span>
                </p>
            </form>
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
        </>
    );
}