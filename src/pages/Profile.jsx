import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import CurrencyDropdown from '../component/CurrencyDropdown';
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function Profile() {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
    let username = localStorage.getItem('username') || 'User';
    let email = localStorage.getItem('email') || 'No email provided';
    const [homeCurrency, setHomeCurrency] = useState(localStorage.getItem('homeCurrency') || 'SGD');

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            username = 'Guest';
            email = 'guest@example.com';
        }
    }
        , []);

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
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg)',
            }}>
                <div style={{
                    background: 'var(--card)',
                    color: 'var(--text)',
                    borderRadius: 16,
                    boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                    padding: '32px 40px',
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 36,
                        fontWeight: 700,
                        margin: '0 auto 24px auto',
                        letterSpacing: 2,
                    }}>
                        {username ? username[0].toUpperCase() : 'U'}
                    </div>
                    <h2 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 28 }}>User Profile</h2>
                    <div style={{ marginBottom: 16 }}>
                        <span style={{ fontWeight: 500, color: 'var(--primary)' }}>Username:</span>
                        <span style={{ marginLeft: 8 }}>{username}</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: 500, color: 'var(--primary)' }}>Email:</span>
                        <span style={{ marginLeft: 8 }}>{email}</span>
                    </div>

                    <div style={{ marginBottom: 20, marginTop: 20, color: 'var(--primary)' }}>
                        Select Home Currency:
                        <CurrencyDropdown currency={homeCurrency} setCurrency={setHomeCurrency} />
                        {localStorage.setItem('homeCurrency', homeCurrency)}
                    </div>
                </div>
            </div>
        </>
    );
}