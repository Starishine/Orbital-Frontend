import { useState } from 'react';
import axios from 'axios';
import React from 'react';

// SignupForm: Handles user registration with username, password, and email validation
export default function SignupForm({ onSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // Handle sign up form submission
    const handleSignup = () => {
        setError('');
        if (!username) return setError('Please Enter User Name');
        if (!password) return setError('Please Enter Password');
        if (!confirmPassword) return setError('Please Confirm Your Password');
        if (password !== confirmPassword) return setError('Passwords do not match');
        if (!email) return setError('Please Enter Email');

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Please enter a valid email address.');

        // Send registration request to backend
        axios.post('/api/signup/register', {
            username: username,
            password: password,
            email: email
        })
            .then((response) => {
                const data = response.data;
                console.log(data);
                // If registration is successful, call onSuccess callback
                if (data.status === "SUCCESS" && data.code === 200) {
                    setError('');
                    onSuccess(data.data);
                } else {
                    setError(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                // show backend error message 
                if (error.response && error.response.data) {
                    setError(error.response.data); // Backend sends plain text error
                } else {
                    setError('An error occurred. Please try again.');
                }
            })
    };

    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                handleSignup();
            }}
            style={{
                width: '350px',
                margin: '0 auto',
                padding: '24px',
                border: '1px solid var(--light)',
                borderRadius: '8px',
                background: 'var(--card)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                color: 'var(--text)'
            }}
        >
            {/* Username input */}
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--text)' }}>
                    Username
                </label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--primary)',
                        borderRadius: '4px',
                        background: 'var(--bg)',
                        color: 'var(--text)'
                    }}
                    autoComplete="username"
                />
            </div>
            {/* password input */}
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--text)' }}>
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--primary)',
                        borderRadius: '4px',
                        background: 'var(--bg)',
                        color: 'var(--text)'
                    }}
                    autoComplete="new-password"
                />
            </div>
            {/* Confirm password input */}
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--text)' }}>
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--primary)',
                        borderRadius: '4px',
                        background: 'var(--bg)',
                        color: 'var(--text)'
                    }}
                    autoComplete="new-password"
                />
            </div>
            {/* Email input */}
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--text)' }}>
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--primary)',
                        borderRadius: '4px',
                        background: 'var(--bg)',
                        color: 'var(--text)'
                    }}
                    autoComplete="email"
                />
            </div>
            {/* Sign up button */}
            <button
                type="submit"
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
                }}
            >
                Sign Up
            </button>
            {/* Error message */}
            {error && (
                <p style={{ color: 'var(--danger)', marginTop: '16px', textAlign: 'center' }}>{error}</p>
            )}
            {/* Switch to sign in */}
            <p style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text)' }}>
                Already have an account?{' '}
                <span
                    style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => window.location.href = '/'} // Redirect to sign-in page
                >
                    Sign In
                </span>
            </p>
        </form>
    );
}