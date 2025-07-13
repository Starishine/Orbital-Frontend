import React from 'react';
import CreateSharedBudgetForm from '../component/CreateSharedBudgetForm';
import SharedBudgetDetail from '../component/SharedBudgetDetail';
import { useLocation, Link, useNavigate } from "react-router-dom";


export default function SharedBudget() {

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('convertedExpenses')
        localStorage.removeItem('homeCurrency')
        localStorage.removeItem('username')
        localStorage.removeItem('email')
        navigate('/'); // Redirect to the home page
    }
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
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Shared Budget</h1>
                <p>You can create your shared budget right here! [Under Construction!]</p>
                <CreateSharedBudgetForm />
                <SharedBudgetDetail />
            </div>
        </>
    );
}