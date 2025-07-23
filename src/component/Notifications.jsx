import React from 'react';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(false);
    const [mlNotifs, setMlNotifs] = useState([]);
    const bell = useRef();
    const isDarkMode = document.body.classList.contains('dark-mode');

    function getNotifHash(notifs) {
        return JSON.stringify(notifs.map(n => n.message).sort());
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }

        Promise.all([
            axios.get(`/api/budget/get`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`/api/expense/get`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`/api/shared-budget/get-by-user`, { headers: { Authorization: `Bearer ${token}` } })
        ])
            .then(([budgetResponse, expenseResponse, sharedBudgetResponse]) => {
                const budgets = budgetResponse.data;
                const expenses = expenseResponse.data;
                const sharedBudgets = sharedBudgetResponse.data;

                const notifs = [];
                const today = new Date();
                budgets.forEach(budget => {
                    if (!budget.expiryDate) return;
                    const expiryDate = budget.expiryDate;
                    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - today) / (1000 * 60 * 60 * 24));
                    if (daysUntilExpiry < 0) {
                        notifs.push({ type: 'expiry', message: `Budget for ${budget.category} has expired.` });
                    } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 5) {
                        notifs.push({ type: 'expiry', message: `Budget for ${budget.category} expires in ${daysUntilExpiry} days.` });
                    }
                    if (budget.amount <= 0) {
                        notifs.push({ type: 'warning', message: `Budget for ${budget.category} has been fully spent.` });
                    }
                });

                if (expenses && expenses.length > 0) {
                    const lastExpenseDate = new Date(expenses.map(exp => new Date(exp.date)).sort((a, b) => b - a)[0]);
                    const today = new Date();
                    lastExpenseDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    const daysSinceLastExpense = Math.ceil((today - lastExpenseDate) / (1000 * 60 * 60 * 24));
                    if (daysSinceLastExpense == 1) {
                        notifs.push({ type: 'reminder', message: 'No expenses logged for today.' });
                    } else if (daysSinceLastExpense > 1) {
                        notifs.push({ type: 'reminder', message: `No expenses logged for the last ${daysSinceLastExpense} days.` });
                    }
                } else {
                    notifs.push({ type: 'reminder', message: 'No expenses logged yet.' });
                }

                if (sharedBudgets && sharedBudgets.length > 0) {
                    sharedBudgets.forEach(sharedBudget => {
                        if (sharedBudget.amount <= 0) {
                            notifs.push({ type: 'warning', message: `Shared budget ${sharedBudget.budgetName} has been fully spent.` });
                        }
                    });
                }

                const notifHash = getNotifHash(notifs);
                const lastReadHash = localStorage.getItem('lastReadNotifHash');
                setUnread(notifHash !== lastReadHash && notifs.length > 0);
                setNotifications(notifs);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch notifications.');
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (bell.current && !bell.current.contains(event.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleBellClick = () => {
        setOpen(o => !o);
        if (!open) {
            const notifHash = getNotifHash(notifications);
            localStorage.setItem('lastReadNotifHash', notifHash);
            setUnread(false);
        }
    };

    // Bell icon SVG
    const BellIcon = (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={isDarkMode ? "#eee" : "currentColor"} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
    );

    if (loading) return <div>Loading Notifications...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div ref={bell} style={{ position: 'relative', display: 'inline-block', marginLeft: 16 }}>
            <button
                onClick={handleBellClick}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: 0,
                    outline: 'none'
                }}
                aria-label="Show notifications"
            >
                {BellIcon}
                {unread && (
                    <span style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 12, // changed: slightly larger dot
                        height: 12, // changed: slightly larger dot
                        background: 'linear-gradient(135deg,#d32f2f,#ff9800)', // changed: gradient for attention
                        borderRadius: '50%',
                        border: '2px solid #fff',
                        display: 'inline-block',
                        boxShadow: '0 0 6px #d32f2f88' // changed: glow effect
                    }} />
                )}
            </button>
            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 32,
                    minWidth: 340, // changed: slightly wider
                    background: isDarkMode ? '#23272f' : '#fff',
                    color: isDarkMode ? '#eee' : '#222',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)', // changed: deeper shadow
                    borderRadius: 14, // changed: more rounded
                    zIndex: 100,
                    padding: '16px 0', // changed: more vertical padding
                    border: isDarkMode ? '1px solid #333' : '1px solid #e3e3e3', // changed: subtle border
                    animation: 'fadeInNotif 0.25s' // changed: fade-in animation
                }}>
                    {/* changed: fade-in animation keyframes */}
                    <style>
                        {`
                        @keyframes fadeInNotif {
                            from { opacity: 0; transform: translateY(-10px);}
                            to { opacity: 1; transform: translateY(0);}
                        }
                        `}
                    </style>
                    <div style={{
                        fontWeight: 700,
                        fontSize: 18, // changed: larger title
                        padding: '0 22px 10px 22px',
                        borderBottom: isDarkMode ? '1px solid #333' : '1px solid #eee',
                        marginBottom: 10,
                        letterSpacing: 1
                    }}>
                        Notifications
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{
                            padding: '16px 22px',
                            color: isDarkMode ? '#aaa' : '#888',
                            fontSize: 16, // changed: larger font
                            textAlign: 'center' // changed: center text
                        }}>
                            No notifications found.
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {notifications.map((notification, index) => (
                                <li key={index} style={{
                                    padding: '12px 22px', // changed: more padding
                                    borderBottom: index !== notifications.length - 1 ? (isDarkMode ? '1px solid #333' : '1px solid #f0f0f0') : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: 16, // changed: larger font
                                    background: index % 2 === 0 ? (isDarkMode ? '#23272f' : '#f7fafd') : 'transparent', // changed: zebra striping
                                    transition: 'background 0.2s'
                                }}>
                                    <span style={{
                                        marginRight: 12,
                                        fontSize: 20, // changed: larger icon
                                        filter: notification.type === 'warning' ? 'drop-shadow(0 0 2px #d32f2f)' : undefined // changed: warning icon glow
                                    }}>
                                        {notification.type === 'expiry' ? '⏰'
                                            : notification.type === 'warning' ? '⚠️' : '🔔'}
                                    </span>
                                    <span>{notification.message}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}