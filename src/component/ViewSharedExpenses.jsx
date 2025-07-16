import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";

export default function ViewSharedExpenses({ budgetId }) {
    const [sharedExpenses, setSharedExpenses] = useState([]);
    const username = localStorage.getItem('username');

    useEffect(() => {
        if (!budgetId) return;
        axios.get(`http://localhost:8080/shared-expense/get-by-budget?budgetId=${budgetId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                setSharedExpenses(response.data);
            })
            .catch(error => {
                console.error("Error fetching shared expenses:", error);
            });
    }, [budgetId]);

    const yourContributions = sharedExpenses.filter(exp => exp.username === username);
    const othersContributions = sharedExpenses.filter(exp => exp.username !== username);

    return (
        <div style={{
            maxWidth: 500,
            width: '100%',
            background: 'var(--card)',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            padding: '32px 24px',
            margin: '0 auto'
        }}>
            <h2>Your Shared Expenses</h2>
            <div>
                <h3 style={{ color: '#388e3c', marginBottom: 8 }}>Your Contributions</h3>
                {yourContributions.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {yourContributions.map(expense => (
                            <li key={expense.id} style={{
                                background: '#e3f2fd',
                                borderRadius: 8,
                                padding: '10px 16px',
                                marginBottom: 8,
                                fontWeight: 500
                            }}>
                                {expense.description} — <span style={{ color: '#1976d2' }}>${expense.amount}</span> <span style={{ fontSize: 13, color: '#555' }}>({expense.date})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>No contributions yet.</div>
                )}
            </div>
            <div>
                <h3 style={{ color: '#d32f2f', marginBottom: 8 }}>Contributions by Others</h3>
                {othersContributions.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {othersContributions.map(expense => (
                            <li key={expense.id} style={{
                                background: '#fff3e0',
                                borderRadius: 8,
                                padding: '10px 16px',
                                marginBottom: 8
                            }}>
                                <b>{expense.username}</b>: {expense.description} — <span style={{ color: '#d32f2f' }}>${expense.amount}</span> <span style={{ fontSize: 13, color: '#555' }}>({expense.date})</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ color: '#888', fontStyle: 'italic' }}>No contributions from others yet.</div>
                )}
            </div>
        </div>
    );
}