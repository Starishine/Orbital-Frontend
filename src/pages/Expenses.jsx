import AddExpenseForm from "../component/AddExpenseForm";
import AddSharedExpenseForm from "../component/AddSharedExpenseForm";
import ExistingExpenses from "../component/ExistingExpense";
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

export default function Expenses() {
    const handleLogout = () => {
        localStorage.removeItem('convertedExpenses')
        localStorage.removeItem('token')
        localStorage.removeItem('homeCurrency')
        localStorage.removeItem('username')
        localStorage.removeItem('email')
        localStorage.removeItem('lastReadNotifHash')
        navigate('/');
    }

    const navigate = useNavigate();
    const [username, setUserName] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    const [showPersonal, setShowPersonal] = useState(true);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
        }
        else {
            const decoded = jwtDecode(token);
            setUserName(decoded.sub);
        }
    }, [navigate]);

    return (
        <>
            <nav style={{
                marginBottom: '24px',
                display: 'flex',
                gap: '16px',
                background: 'var(--card)',
                color: 'var(--text)',
                padding: '12px 24px',
                borderRadius: 'var(--round-md)',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
            }}>
                <Link to="/dashboard" style={{ color: 'var(--primary)' }}>Dashboard</Link>
                <Link to="/exchange" style={{ color: 'var(--primary)' }}>Exchange</Link>
                <Link to="/expenses" style={{ color: 'var(--primary)' }}>Expenses</Link>
                <Link to="/visualisation" style={{ color: 'var(--primary)' }}>Visualisation</Link>
                <Link to="/shared-budget" style={{ color: 'var(--primary)' }}>Shared Budget</Link>
                <Link to="/profile" style={{ color: 'var(--primary)' }}>Profile</Link>
                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: 'auto',
                        background: 'var(--primary)',
                        color: 'var(--card)',
                        border: 'none',
                        borderRadius: 'var(--round-sm)',
                        padding: '6px 16px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </nav>
            <div style={{
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center'
            }}>
                <h1>Set your expenses</h1>
                <p>This is the expenses page where you can manage your expenses.</p>

                {/* Toggle for personal vs shared expenses */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '32px 0 24px 0', gap: '24px' }}>
                    <label style={{ fontWeight: 500, color: showPersonal ? '#1976d2' : '#888' }}>
                        <input
                            type="radio"
                            checked={showPersonal}
                            onChange={() => setShowPersonal(true)}
                            style={{ marginRight: 8 }}
                        />
                        Personal Expense
                    </label>
                    <label style={{ fontWeight: 500, color: !showPersonal ? '#1976d2' : '#888' }}>
                        <input
                            type="radio"
                            checked={!showPersonal}
                            onChange={() => setShowPersonal(false)}
                            style={{ marginRight: 8 }}
                        />
                        Shared Expense
                    </label>
                </div>
                {/* Conditional Form */}
                {showPersonal ? (
                    <>
                        <div style={{
                            width: '420px',
                            background: 'var(--card)',
                            borderRadius: 'var(--round-md)',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                            padding: '24px',
                            margin: '0 auto'
                        }}>
                            <h2 style={{ marginBottom: '16px', color: '#1976d2' }}>Personal Expense</h2>
                            <AddExpenseForm />
                        </div>
                        <div style={{
                            maxWidth: '1000px',
                            width: '100%',
                            background: 'var(--card)',
                            borderRadius: 'var(--round-md)',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                            padding: '24px'
                        }}>
                            <ExistingExpenses />
                        </div>
                    </>

                ) : (
                    <div style={{
                        width: '420px',
                        background: 'var(--card)',
                        borderRadius: 'var(--round-md)',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                        padding: '24px',
                        margin: '0 auto'
                    }}>
                        <h2 style={{ marginBottom: '16px', color: '#1976d2' }}>Shared Expense</h2>
                        <AddSharedExpenseForm />
                    </div>
                )}
            </div>
        </>
    );
}