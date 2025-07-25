import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EmailInvite() {
    const username = localStorage.getItem('username');
    const [showNotif, setShowNotif] = useState(false);
    const [showMessage, setShowMessage] = useState(false);

    // Theme sync with Dashboard
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const theme = {
        cardBg: darkMode ? '#2e3a59' : '#fff',
        textColor: darkMode ? '#e3f2fd' : '#222',
        primary: darkMode ? '#90caf9' : '#1976d2',
        accent: '#ffd700',
        iconBg: darkMode ? '#263859' : '#e3f2fd',
        iconColor: darkMode ? '#90caf9' : '#1976d2'
    };

    useEffect(() => {
        axios.get('/api/shared-budget/get-by-user', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => {
                const data = response.data;
                let found = false;
                data.forEach(budget => {
                    if (Array.isArray(budget.invites)) {
                        budget.invites.forEach(invite => {
                            if (invite.username === username && invite.status === 'invited') {
                                found = true;
                            }
                        });
                    }
                });
                setShowNotif(found);
            })
            .catch(error => {
                console.error('Error fetching email invite:', error);
            });
    }, [username]);

    const handleIconClick = () => {
        setShowMessage(true);
    };

    const handleViewInvite = () => {
        window.location.href = 'http://ec2-13-214-147-199.ap-southeast-1.compute.amazonaws.com:9080';
    };

    return (
        <div>
            {showNotif && !showMessage && (
                <span
                    role="button"
                    tabIndex={0}
                    aria-label="email invite"
                    onClick={handleIconClick}
                    style={{
                        fontSize: 28,
                        color: theme.iconColor,
                        background: theme.iconBg,
                        borderRadius: '50%',
                        padding: 8,
                        border: `1px solid ${theme.primary}`,
                        boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)',
                        cursor: 'pointer',
                        display: 'inline-block'
                    }}
                >
                    📩
                </span>
            )}
            {showNotif && showMessage && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: theme.cardBg,
                        border: `1px solid ${theme.accent}`,
                        borderRadius: 14,
                        padding: '12px 18px',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                        marginBottom: 16,
                        color: theme.textColor,
                        fontFamily: 'Inter, Arial, sans-serif',
                        fontSize: 17,
                        maxWidth: 340,
                        position: 'relative'
                    }}
                >
                    <span
                        role="img"
                        aria-label="email"
                        style={{
                            fontSize: 24,
                            marginRight: 12,
                            color: theme.iconColor,
                            background: theme.iconBg,
                            borderRadius: '50%',
                            padding: 6,
                            border: `1px solid ${theme.primary}`,
                            boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)'
                        }}
                    >
                        📩
                    </span>
                    <span style={{ flex: 1 }}>
                        You have <b>an email invite</b>
                    </span>
                    <button
                        onClick={handleViewInvite}
                        style={{
                            marginLeft: 16,
                            background: theme.primary,
                            color: theme.cardBg,
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 16px',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = theme.iconColor}
                        onMouseOut={e => e.currentTarget.style.background = theme.primary}
                    >
                        View Invite
                    </button>
                    <button
                        onClick={() => setShowMessage(false)}
                        style={{
                            position: 'absolute',
                            top: 3,
                            right: 10,
                            background: 'transparent',
                            border: 'none',
                            color: theme.iconColor,
                            fontSize: 20,
                            cursor: 'pointer',
                            padding: 0
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}