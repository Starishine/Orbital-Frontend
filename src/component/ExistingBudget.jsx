import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import EditBudget from './EditBudget';
import DeleteBudget from './DeleteBudget';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ExistingBudget() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editIdx, setEditIdx] = useState(null);
    const [showExpired, setShowExpired] = useState(false);

    useEffect(() => {
        // Fetch budgets for the logged-in user
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }

        axios.get(`/api/budget/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => {
                setBudgets(response.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch budgets.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading budgets...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const refreshBudgets = () => {
        // Refresh budgets after edit/delete
        axios.get(`/api/budget/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
            .then(response => setBudgets(response.data));
        setEditIdx(null);
    };

    const today = new Date().toISOString().split('T')[0];
    // Split budgets into active and expired
    const activeBudgets = budgets.filter(b => b.expiryDate == "" || b.expiryDate >= today);
    const expiredBudgets = budgets.filter(b => b.expiryDate && b.expiryDate < today);

    // Render a single budget card with chart and actions
    const renderBudgetCard = (budget, idx) => {
        // Calculate spent and remaining amounts
        const spent = budget.amountAllocated - budget.amount;
        // Chart.js data structure for horizontal bar
        const data = {
            labels: [''],
            datasets: [
                {
                    label: 'Spent',
                    data: [spent],
                    backgroundColor: '#d32f2f',
                },
                {
                    label: 'Remaining',
                    data: [budget.amount],
                    backgroundColor: '#388e3c',
                },
            ],
        };
        // Chart.js options for horizontal stacked bar
        const options = {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { enabled: true },
            },
            scales: {
                x: {
                    stacked: true,
                    min: 0,
                    max: budget.amountAllocated,
                    ticks: {
                        callback: value => `${budget.currency} ${Number(value).toFixed(2)}`
                    }
                },
                y: { stacked: true }
            }
        };

        return (
            <div
                key={budget._id || idx}
                style={{
                    width: '100%',
                    maxWidth: 420, // changed: slightly wider card
                    margin: '28px auto', // changed: more vertical spacing
                    background: 'linear-gradient(135deg, var(--card) 80%, #e3f2fd 100%)', // changed: subtle gradient
                    padding: '24px', // changed: more padding
                    borderRadius: '18px', // changed: more rounded corners
                    border: 'none', // changed: removed dotted border
                    boxShadow: '0 6px 24px rgba(25, 118, 210, 0.10)', // changed: deeper shadow for pop effect
                    position: 'relative',
                    transition: 'box-shadow 0.2s',
                }}
            >
                {/* Decorative icon for budget category */}
                <div style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    fontSize: 28,
                    opacity: 1.0,
                    pointerEvents: 'none'
                }}>
                    💸
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.2em', marginBottom: 8, letterSpacing: 1 }}>
                    {/* Show budget category */}
                    {budget.category}
                </div>
                <div style={{ color: 'var(--primary)', fontSize: 15, marginBottom: 8 }}>
                    {/* Show expiry date or N/A */}
                    <span role="img" aria-label="calendar" style={{ marginRight: 6 }}>📅</span>
                    Expiry: {budget.expiryDate || 'N/A'}
                </div>
                {/* Budget bar chart */}
                <div style={{ margin: '18px 0 10px 0', background: '#f5f7fa', borderRadius: 8, padding: 8 }}>
                    <Bar
                        data={data}
                        options={{
                            ...options,
                            elements: {
                                bar: {
                                    barThickness: 32 // changed: slightly thinner bar for aesthetics
                                }
                            }
                        }}
                        height={60}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    color: 'var(--text)',
                    fontSize: 15,
                    fontWeight: 500
                }}>
                    <span>
                        <span role="img" aria-label="money" style={{ marginRight: 4 }}>💰</span>
                        Allocated: {budget.currency} {Number(budget.amountAllocated).toFixed(2)}
                    </span>
                    <span>
                        <span role="img" aria-label="money" style={{ marginRight: 4 }}>🟢</span>
                        Remaining: {budget.currency} {Number(budget.amount).toFixed(2)}
                    </span>
                </div>
                {/* Edit and Delete actions */}
                {editIdx === idx ? (
                    <EditBudget
                        budget={budget}
                        onSave={refreshBudgets}
                        onCancel={() => setEditIdx(null)}
                    />
                ) : (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                        marginTop: 18
                    }}>
                        <button
                            style={{
                                border: 'none', // changed: flat button
                                borderRadius: 6, // changed: more rounded
                                padding: '8px 18px',
                                background: 'var(--primary)',
                                color: 'var(--card)',
                                fontWeight: 600,
                                fontSize: 15,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                            onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
                            onClick={() => setEditIdx(idx)}
                        >
                            ✏️ Edit
                        </button>
                        <DeleteBudget
                            budgetId={budget.id}
                            onDeleteSuccess={refreshBudgets}
                            buttonStyle={{
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 18px',
                                background: '#d32f2f',
                                color: 'var(--card)',
                                fontWeight: 600,
                                fontSize: 15,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                                transition: 'background 0.2s'
                            }}
                        />
                    </div>
                )}
            </div>
        );
    
    };

    return (
        <div>
            {/* Button to view expired budgets */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                    onClick={() => setShowExpired(true)}
                    style={{
                        background: 'var(--primary)',
                        color: 'var(--card)',
                        border: 'none',
                        borderRadius: 8, // changed: more rounded
                        padding: '10px 24px', // changed: larger button
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                    onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
                >
                    🕒 View Expired Budgets
                </button>
            </div>
            <h3 style={{ marginBottom: '20px', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Active Budgets (Set in home currency)</h3>
            {activeBudgets.length === 0 ? (
                <p>No active budgets.</p>
            ) : (
                activeBudgets.map(renderBudgetCard)
            )}

            {/* Overlay for expired budgets */}
            {showExpired && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(30, 32, 38, 0.90)', // changed: darker overlay
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflowY: 'auto',
                        paddingTop: 40
                    }}
                >
                    <div style={{ width: '100%', maxWidth: 500, marginBottom: 24, textAlign: 'right' }}>
                        <button
                            onClick={() => setShowExpired(false)}
                            style={{
                                background: 'var(--primary)',
                                color: 'var(--card)',
                                border: 'none',
                                borderRadius: 8,
                                padding: '10px 24px',
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: 'pointer',
                                marginBottom: 16,
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--primary-dark)'}
                            onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'}
                        >
                            Close
                        </button>
                    </div>
                    <h3 style={{ color: 'var(--card)', marginBottom: 20, fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Expired Budgets (History)</h3>
                    {expiredBudgets.length === 0 ? (
                        <p style={{ color: 'var(--card)' }}>No expired budgets.</p>
                    ) : (
                        expiredBudgets.map(renderBudgetCard)
                    )}
                </div>
            )}
        </div>
    );
}