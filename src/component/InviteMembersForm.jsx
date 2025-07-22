import React, { useState } from "react";
import axios from "axios";

export default function InviteMembersForm({ invites, setInvites }) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleAddInvite = () => {
        if (!email || !username) {
            setError('Please enter both username and email address');
            return;
        }
        if (invites.some(invite => invite.email === email)) {
            setError('This email is already invited');
            return;
        }

        // check if user inputs own username and email
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
                    // refresh invites
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
        <div style={{ margin: '0', width: '100%' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        flex: 1,
                        padding: 8,
                        borderRadius: 4,
                        border: '1px solid #ccc',
                        background: 'var(--bg)',
                        color: 'var(--text)'
                    }}
                />
                <input
                    type="email"
                    placeholder="Invite member by email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        flex: 2,
                        padding: 8,
                        borderRadius: 4,
                        border: '1px solid #ccc',
                        background: 'var(--bg)',
                        color: 'var(--text)'
                    }}
                />
            </div>
            <button
                type="button"
                onClick={handleAddInvite}
                style={{
                    padding: '8px 14px',
                    background: 'var(--primary)',
                    color: 'var(--card)',
                    border: 'none',
                    borderRadius: 4,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                }}
            >
                Add Invite
            </button>
            <div style={{ marginBottom: 10 }}>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                {invites.length > 0 && (
                    <ul style={{ paddingLeft: 18, marginTop: 8, color: 'var(--text)' }}>
                        {invites.map((invite, index) => (
                            <li key={index} style={{
                                marginBottom: 4,
                                color: 'var(--text)',
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