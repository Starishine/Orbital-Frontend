import BudgetForecast from "../component/BudgetForecast"
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import React from "react";

export default function Visualisation() {
    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/'); // Redirect to the home page
    }

    const navigate = useNavigate();
    const [username, setUserName] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/'); // Redirect to login/signin page if token is missing
        }
        else {
            const decoded = jwtDecode(token);
            setUserName(decoded.sub); // Extract username from token
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
                padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center', color: 'var(--text)'
            }}>
                <h1>Visualisation</h1>
                <p>This is the visualisation page where you can see your budget forecast.</p>
                <BudgetForecast />
            </div>
        </>

    );
}
