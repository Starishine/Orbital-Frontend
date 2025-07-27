import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import EditBudget from './EditBudget';
import DeleteBudget from './DeleteBudget';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ExistingBudget: Displays all user budgets with edit/delete options and visual progress bars

export default function ExistingBudget() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editIdx, setEditIdx] = useState(null);
    const [showExpired, setShowExpired] = useState(false);

    // Fetch budgets 
    useEffect(() => {
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
    // Refresh budgets after edit/delete
    const refreshBudgets = () => {
        axios.get(`/api/budget/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
            .then(response => setBudgets(response.data));
        setEditIdx(null);
    };

    // Split budgets into active and expired
    const today = new Date().toISOString().split('T')[0];
    const activeBudgets = budgets.filter(b => b.expiryDate == "" || b.expiryDate >= today);
    const expiredBudgets = budgets.filter(b => b.expiryDate && b.expiryDate < today);

    // Theme to match AddBudgetForm
    const theme = {
        primary: '#1976d2',
        accent: '#90caf9',
        card: '#fff',
        dark: '#263859',
        border: '#e3f2fd',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
        inputBg: '#f5f5f5'
    };

    // Render a single budget card with progress bar 
    const renderBudgetCard = (budget, idx) => {
        const spent = budget.amountAllocated - budget.amount;
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
                    maxWidth: 420,
                    margin: '28px auto',
                    background: theme.card,
                    color: theme.dark,
                    padding: '32px',
                    borderRadius: 18,
                    border: `1px solid ${theme.border}`,
                    boxShadow: theme.shadow,
                    position: 'relative',
                    transition: 'box-shadow 0.2s',
                    fontFamily: 'Inter, Arial, sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                {/* Budget icon */}
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
                {/* Budget name */}
                <div style={{
                    fontWeight: 800,
                    fontSize: 22,
                    marginBottom: 8,
                    letterSpacing: 1,
                    color: theme.primary,
                    textAlign: 'center'
                }}>
                    {budget.category}
                </div>
                {/* Expiry date */}
                <div style={{
                    color: theme.dark,
                    fontSize: 15,
                    marginBottom: 8,
                    textAlign: 'center'
                }}>
                    <span role="img" aria-label="calendar" style={{ marginRight: 6 }}>📅</span>
                    Expiry: {budget.expiryDate || 'N/A'}
                </div>
                {/* Progress bar */}
                <div style={{
                    margin: '18px 0 10px 0',
                    background: theme.inputBg,
                    borderRadius: 10,
                    padding: 12,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
                    width: '100%',
                    minHeight: 100
                }}>
                    <Bar
                        data={data}
                        options={{
                            ...options,
                            elements: {
                                bar: {
                                    barThickness: 32
                                }
                            }
                        }}
                        height={70}
                    />
                </div>
                {/* Allocated and remaining amounts */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    color: theme.dark,
                    fontSize: 15,
                    fontWeight: 600,
                    width: '100%'
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
                {/* show EditBudget form, else show Edit/Delete buttons */}
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
                        marginTop: 18,
                        width: '100%'
                    }}>
                        {/* Edit button */}
                        <button
                            style={{
                                border: 'none',
                                borderRadius: 8,
                                padding: '10px 24px',
                                background: theme.primary,
                                color: theme.card,
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: 'pointer',
                                boxShadow: theme.shadow,
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = theme.dark}
                            onMouseOut={e => e.currentTarget.style.background = theme.primary}
                            onClick={() => setEditIdx(idx)}
                        >
                            ✏️ Edit
                        </button>
                        {/* Delete button */}
                        <DeleteBudget
                            budgetId={budget.id}
                            onDeleteSuccess={refreshBudgets}
                            buttonStyle={{
                                border: 'none',
                                borderRadius: 8,
                                padding: '10px 24px',
                                background: '#d32f2f',
                                color: theme.card,
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: 'pointer',
                                boxShadow: theme.shadow,
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
                        background: theme.primary,
                        color: theme.card,
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: theme.shadow,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.dark}
                    onMouseOut={e => e.currentTarget.style.background = theme.primary}
                >
                    🕒 View Expired Budgets
                </button>
            </div>
            {/* <h3 style={{
                marginBottom: '20px',
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: 1,
                color: theme.primary,
            }}> */}
            {/* </h3> */}
            {/* List of active budgets */}
            {activeBudgets.length === 0 ? (
                <p>No active budgets.</p>
            ) : (
                activeBudgets.map(renderBudgetCard)
            )}

            {/* Expired budgets */}
            {showExpired && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(30, 32, 38, 0.90)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overflowY: 'auto',
                        paddingTop: 40
                    }}
                >
                    {/* Close button for expired budgets modal */}
                    <div style={{ width: '100%', maxWidth: 500, marginBottom: 24, textAlign: 'right' }}>
                        <button
                            onClick={() => setShowExpired(false)}
                            style={{
                                background: theme.primary,
                                color: theme.card,
                                border: 'none',
                                borderRadius: 8,
                                padding: '10px 24px',
                                fontWeight: 700,
                                fontSize: 16,
                                cursor: 'pointer',
                                marginBottom: 16,
                                boxShadow: theme.shadow,
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.background = theme.dark}
                            onMouseOut={e => e.currentTarget.style.background = theme.primary}
                        >
                            Close
                        </button>
                    </div>
                    {/* Expired budgets title */}
                    <h3 style={{
                        color: theme.card,
                        marginBottom: 20,
                        fontWeight: 800,
                        fontSize: 24,
                        letterSpacing: 1,
                        textAlign: 'center'
                    }}>
                        Expired Budgets (History)
                    </h3>
                    {/* List of expired budgets */}
                    {expiredBudgets.length === 0 ? (
                        <p style={{ color: theme.card }}>No expired budgets.</p>
                    ) : (
                        expiredBudgets.map(renderBudgetCard)
                    )}
                </div>
            )}
        </div>
    );
}