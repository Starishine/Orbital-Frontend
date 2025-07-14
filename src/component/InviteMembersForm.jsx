import React, { useState } from "react";

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

        axios.post('http://localhost:8080/signup/checkAccount', {
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
        <div style={{ margin: '12px 0' }}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ marginRight: 8 }}
            />
            <input
                type="email"
                placeholder="Invite member by email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginRight: 8 }}
            />
            <button type="button" onClick={handleAddInvite}>Add Invite</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <ul>
                {invites.map((invite, index) => (
                    <li key={index}>{invite.username} ({invite.email})</li>
                ))}
            </ul>
        </div>
    );
}