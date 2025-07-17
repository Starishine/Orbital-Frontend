import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import DebtSimplification from "./DebtSimplification";
import VisualisationRing from "./VisualisationRing";

export default function ViewSharedExpenses({ budgetId, inviter, invitees }) {
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

    // Collect all members: inviter + invitees (accepted only)
    const members = inviter
        ? [inviter, ...(invitees ? invitees.filter(i => i.status === "accepted").map(i => i.username) : [])]
        : [];

    return (
        <div style={{
            maxWidth: 540,
            width: '100%',
            background: 'var(--card)',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.10)',
            padding: '36px 28px',
            margin: '0 auto'
        }}>
            <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 28, letterSpacing: 1 }}>Your Shared Expenses</h2>
            <div style={{
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginBottom: 24,
                alignItems: 'stretch'
            }}>
                {/* Your Contributions */}
                <div style={{
                    flex: 1,
                    minWidth: 220,
                    background: '#9fd9f0ff',
                    borderRadius: 10,
                    padding: '18px 14px',
                    marginBottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    <h3 style={{ color: '#388e3c', marginBottom: 10, fontSize: 18 }}>Your Contributions</h3>
                    {yourContributions.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {yourContributions.map(expense => (
                                <li key={expense.id} style={{
                                    background: '#e0f7fa',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)'
                                }}>
                                    <span style={{ color: 'black' }} >{expense.description}</span>
                                    <span style={{ float: 'right', color: '#1976d2' }}>${expense.amount}</span>
                                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{expense.date}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: '#888', fontStyle: 'italic' }}>No contributions yet.</div>
                    )}
                </div>


                {/* Others' Contributions */}
                <div style={{
                    flex: 1,
                    minWidth: 220,
                    background: '#fff3e0',
                    borderRadius: 8,
                    padding: '18px 14px',
                    marginBottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    <h3 style={{ color: '#d32f2f', marginBottom: 10, fontSize: 18 }}>Contributions by Others</h3>
                    {othersContributions.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {othersContributions.map(expense => (
                                <li key={expense.id} style={{
                                    background: '#fff',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    marginBottom: 8,
                                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)'
                                }}>
                                    <b style={{ color: 'black' }}>{expense.username} : </b> <span style={{ color: 'black' }}>{expense.description}</span>
                                    <span style={{ float: 'right', color: '#d32f2f' }}>${expense.amount}</span>
                                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{expense.date}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: '#888', fontStyle: 'italic' }}>No contributions from others yet.</div>
                    )}
                </div>
            </div>
            <DebtSimplification
                expenses={sharedExpenses}
                members={members}
            />
        </div>
    );
}