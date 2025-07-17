import React, { useState, useEffect } from 'react';
import CreateSharedBudgetForm from '../component/CreateSharedBudgetForm';
import SharedBudgetDetail from '../component/SharedBudgetDetail';
import ViewSharedExpenses from '../component/ViewSharedExpenses';
import { Link, useNavigate } from "react-router-dom";

export default function SharedBudget() {
    const [selectedBudgetId, setSelectedBudgetId] = useState('');
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('convertedExpenses');
        localStorage.removeItem('homeCurrency');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        navigate('/');
    };

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

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
                background: 'var(--bg)',
                color: 'var(--text)',
                minHeight: '100vh'
            }}>
                <h1>Shared Budgets</h1>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', justifyContent: 'center' }}>
                    <div style={{
                        width: '420px',
                        background: 'var(--card)',
                        borderRadius: 'var(--round-md)',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                        padding: '24px'
                    }}>
                        <CreateSharedBudgetForm />
                    </div>
                    <div>
                        <div style={{
                            width: '500px',
                            background: 'var(--card)',
                            borderRadius: 'var(--round-md)',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                            padding: '24px'
                        }}>
                            <SharedBudgetDetail
                                selectedBudgetId={selectedBudgetId}
                                setSelectedBudgetId={setSelectedBudgetId}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}