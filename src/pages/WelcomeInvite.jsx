import React from "react";
import { useEffect } from "react";
import axios from "axios";
import logo from "../assets/money-tree-logo.jpg";
import { useSearchParams } from "react-router-dom";

// WelcomeInvite: Page shown after a user accepts a shared budget invitation via email link
export default function WelcomeInvite() {
    // Get token from URL query params
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // On mount, call backend to accept the invite using the token
    useEffect(() => {
        axios.get(`/api/shared-budget/accept?token=${token}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .catch(error => {
                console.error('Error accepting invite:', error);
                alert('Failed to accept the invitation. Please try again later.');
            });
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: 'Arial, sans-serif'
        }}>
            {/* Card with logo and success message */}
            <div style={{
                background: 'var(--card)',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(25, 118, 210, 0.10)',
                padding: '40px 32px',
                maxWidth: 420,
                textAlign: 'center'
            }}>
                <img
                    src={logo}
                    alt="BudgetBuddy Logo"
                    width={64}
                    height={64}
                    style={{ marginBottom: 16 }}
                />
                <h1 style={{ color: '#1976d2', marginBottom: 12 }}>Invitation Accepted!</h1>
                <p style={{ fontSize: 18, marginBottom: 18 }}>
                    🎉 You’ve successfully joined the shared budget!
                </p>
                <p style={{ fontSize: 16, color: '#444', marginBottom: 24 }}>
                    You can now view and track your expenses with your group.
                    Head over to your <b>Shared Budgets</b> tab to get started.
                </p>
                {/* Button to go to shared budgets page */}
                <a
                    href="/shared-budget"
                    style={{
                        display: 'inline-block',
                        background: '#1976d2',
                        color: '#fff',
                        borderRadius: 6,
                        padding: '12px 28px',
                        fontWeight: 600,
                        fontSize: 16,
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                    }}
                >
                    Go to Shared Budgets
                </a>
            </div>
        </div>
    );
}