import { useState } from 'react';
import axios from 'axios';

export default function SignupForm({ onSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleSignup = () => {
        setError('');
        if (!username) return setError('Please Enter User Name');
        if (!password) return setError('Please Enter Password');
        if (!confirmPassword) return setError('Please Confirm Your Password');
        if (password !== confirmPassword) return setError('Passwords do not match');

        if (!email) return setError('Please Enter Email');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setError('Please enter a valid email address.');

        axios.post('http://localhost:8080/signup/register', {
            username: username,
            password: password,
            email: email
        })
            .then((response) => {
                const data = response.data;
                console.log(data);
                if (data.status === "SUCCESS" && data.code === 200) {
                    setError('');
                    onSuccess(data.data);
                } else {
                    setError(data.message);
                }
            })
            .catch((error) => {
                console.log(error);
                // This will show the backend error message
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
                maxWidth: '350px',
                margin: '0 auto',
                padding: '24px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: '#fafbfc',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
        >
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
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
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    autoComplete="username"
                />
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
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
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    autoComplete="new-password"
                />
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
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
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    autoComplete="new-password"
                />
            </div>
            <div style={{ marginBottom: '16px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>
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
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                    }}
                    autoComplete="email"
                />
            </div>
            <button
                type="submit"
                style={{
                    width: '100%',
                    padding: '10px',
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Sign Up
            </button>
            {error && (
                <p style={{ color: 'red', marginTop: '16px', textAlign: 'center' }}>{error}</p>
            )}
            <p style={{ marginTop: '16px', textAlign: 'center' }}>
                Already have an account?{' '}
                <span
                    style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => window.location.href = '/'} // Redirect to sign-in page
                >
                    Sign In
                </span>
            </p>
        </form>
    );
}