import React, { useState } from "react";
import axios from "axios";

export default function InviteMembersForm({ invites, setInvites }) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    // Theme to match the rest of the app
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const theme = {
        primary: '#1976d2',
        card: '#fff',
        dark: '#263859',
        border: '#e3f2fd',
        text: darkMode ? '#e3f2fd' : '#222',
        inputBg: darkMode ? '#1e2746' : '#f5f5f5'
    };

    const handleAddInvite = () => {
        if (!email || !username) {
            setError('Please enter both username and email address');
            return;
        }
        if (invites.some(invite => invite.email === email)) {
            setError('This email is already invited');
            return;
        }
        if (username === localStorage.getItem('username') && email === localStorage.getItem('email')) {
            setError('You cannot invite yourself');
            return;
        }

        axios.post('/api/signup/checkAccount', {
            username: username,
            email: email,
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => {
                if (response.data.status === "SUCCESS") {
                    setInvites([...invites, { username, email }]);
                    setEmail('');
                    setUsername('');
                    setError('');
                } else {
                    setError('User does not exist');
                }
            })
            .catch(() => {
                setError('Failed to check user existence');
            });
    };

    return (
        <div style={{ margin: 0, width: '100%' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: '#fff', // Always white background
                        color: theme.text,
                        fontSize: 15,
                        outline: 'none'
                    }}
                />
                <input
                    type="email"
                    placeholder="Invite member by email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        flex: 2,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: `1px solid ${theme.border}`,
                        background: '#fff', // Always white background
                        color: theme.text,
                        fontSize: 15,
                        outline: 'none'
                    }}
                />
            </div>
            <button
                type="button"
                onClick={handleAddInvite}
                style={{
                    padding: '10px 24px',
                    background: theme.primary,
                    color: theme.card,
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                    transition: 'background 0.2s',
                    marginBottom: 8
                }}
                onMouseOver={e => e.currentTarget.style.background = theme.dark}
                onMouseOut={e => e.currentTarget.style.background = theme.primary}
            >
                Add Invite
            </button>
            <div style={{ marginBottom: 10 }}>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                {invites.length > 0 && (
                    <ul style={{ paddingLeft: 18, marginTop: 8, color: theme.text }}>
                        {invites.map((invite, index) => (
                            <li key={index} style={{
                                marginBottom: 4,
                                color: theme.text,
                                fontSize: 15
                            }}>
                                {invite.username} <span style={{ color: '#888' }}>({invite.email})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}