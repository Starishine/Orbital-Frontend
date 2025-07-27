import React, { useState } from "react";
import axios from "axios";

// InviteMembersForm: Lets user invite members by username and email, checks for duplicates and self-invite
export default function InviteMembersForm({ invites, setInvites }) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    // Add invite to the list 
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
        <div style={{ width: '100%' }}>
            {/* Input fields for username and email */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e3f2fd',
                        background: '#f5f5f5',
                        color: '#263859',
                        fontSize: 16,
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
                        border: '1px solid #e3f2fd',
                        background: '#f5f5f5',
                        color: '#263859',
                        fontSize: 16,
                        outline: 'none'
                    }}
                />
            </div>
            {/* Add Invite button */}
            <button
                type="button"
                onClick={handleAddInvite}
                style={{
                    width: '100%',
                    padding: '10px 0',
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                    transition: 'background 0.2s',
                    marginBottom: 8
                }}
                onMouseOver={e => e.currentTarget.style.background = '#263859'}
                onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
            >
                Add Invite
            </button>
            {/* Error message */}
            {error && <div style={{ color: '#d32f2f', marginBottom: 8, fontWeight: 600 }}>{error}</div>}
            {/* List of invited members */}
            {invites.length > 0 && (
                <ul style={{ paddingLeft: 18, marginTop: 8, color: '#263859', fontSize: 15 }}>
                    {invites.map((invite, index) => (
                        <li key={index} style={{
                            marginBottom: 4,
                            color: '#263859',
                            fontSize: 15
                        }}>
                            {invite.username} <span style={{ color: '#888' }}>({invite.email})</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}