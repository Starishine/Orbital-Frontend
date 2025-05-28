import { useState } from 'react';
import axios from 'axios';

export default function SignInForm({ onSuccess, onSwitchToSignUp }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignIn = () => {
        setError('');
        if (!username) return setError('Please enter your username');
        if (!password) return setError('Please enter your password');

        axios.post('http://localhost:8080/signup/login', {
            username: username,
            password: password
        })
            .then(res => {
                const data = res.data;
                console.log(data);
                if (data.status === "SUCCESS" && data.code === 200) {
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
        <>
            <form
                onSubmit={e => { e.preventDefault(); handleSignIn(); }}
                style={{
                    maxWidth: '350px', margin: '0 auto', padding: '24px', border: '1px solid #ddd',
                    borderRadius: '8px', background: '#fafbfc', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
            >
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="username" style={{ flex: '0 0 130px', marginRight: '10px', fontWeight: 500 }}>Username</label>
                    <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                        style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} autoComplete="username" />
                </div>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    <label htmlFor="password" style={{ flex: '0 0 130px', marginRight: '10px', fontWeight: 500 }}>Password</label>
                    <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                        style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} autoComplete="current-password" />
                </div>
                <button type="submit"
                    style={{
                        width: '100%', padding: '10px', background: '#1976d2', color: '#fff',
                        border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '16px', cursor: 'pointer'
                    }}>
                    Sign In
                </button>
                {error && <p style={{ color: 'red', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
                <p style={{ marginTop: '16px', textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <span style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }} onClick={onSwitchToSignUp}>
                        Sign Up
                    </span>
                </p>
            </form>
        </>
    );
}