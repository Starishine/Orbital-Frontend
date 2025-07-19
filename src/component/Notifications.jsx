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
            axios.get(`http://localhost:8080/budget/get`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`http://localhost:8080/expense/get`, { headers: { Authorization: `Bearer ${token}` } }),
        ])

            .then(([budgetResponse, expenseResponse]) => {
                const budgets = budgetResponse.data;
                const expenses = expenseResponse.data;

                console.log('Budgets:', budgets);
                console.log('Expenses:', expenses);

                const notifs = [];
                const today = new Date();
                budgets.forEach(budget => {
                    if (!budget.expiryDate) return; // Skip budgets without expiry
                    const expiryDate = budget.expiryDate;
                    console.log('Expiry date:', expiryDate);
                    // count the number of days until expiry
                    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - today) / (1000 * 60 * 60 * 24));
                    // Notify if budget is expiring in 5 days or less

                    if (daysUntilExpiry < 0) {
                        notifs.push({ type: 'expiry', message: `Budget for ${budget.category} has expired.` });
                    } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 5) {
                        notifs.push({ type: 'expiry', message: `Budget for ${budget.category} expires in ${daysUntilExpiry} days.` });
                    }

                    if (budget.amount <= 0) {
                        notifs.push({ type: 'warning', message: `Budget for ${budget.category} has been fully spent.` });
                    }
                });

                // Notify if no expense loggeed for the day
                if (expenses && expenses.length > 0) {
                    const lastExpenseDate = new Date(expenses.map(exp => new Date(exp.date)).sort((a, b) => b - a)[0]);
                    console.log('Last expense date:', lastExpenseDate);
                    const today = new Date();

                    // Remove time from dates for comparison
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

                const notifHash = getNotifHash(notifs);
                const lastReadHash = localStorage.getItem('lastReadNotifHash');
                setUnread(notifHash !== lastReadHash && notifs.length > 0);
                console.log('Notifications:', notifs);
                setNotifications(notifs);
                setLoading(false);
            })

            .catch(() => {
                setError('Failed to fetch notifications.');
                setLoading(false);
            });

    }, []);



    // Close dropdown when clicking outside
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
        if (!open) { // Only mark as read when opening
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
                        width: 10,
                        height: 10,
                        background: '#d32f2f',
                        borderRadius: '50%',
                        border: '2px solid #fff',
                        display: 'inline-block'
                    }} />
                )}
            </button>
            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 32,
                    minWidth: 320,
                    background: isDarkMode ? '#23272f' : '#fff',
                    color: isDarkMode ? '#eee' : '#222',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                    borderRadius: 10,
                    zIndex: 100,
                    padding: '12px 0'
                }}>
                    <div style={{
                        fontWeight: 600,
                        fontSize: 17,
                        padding: '0 18px 8px 18px',
                        borderBottom: isDarkMode ? '1px solid #333' : '1px solid #eee',
                        marginBottom: 8
                    }}>
                        Notifications
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: '12px 18px', color: isDarkMode ? '#aaa' : '#888', fontSize: 15 }}>
                            No notifications found.
                        </div>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {notifications.map((notification, index) => (
                                <li key={index} style={{
                                    padding: '10px 18px',
                                    borderBottom: index !== notifications.length - 1 ? (isDarkMode ? '1px solid #333' : '1px solid #f0f0f0') : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: 15
                                }}>
                                    <span style={{ marginRight: 10 }}>
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