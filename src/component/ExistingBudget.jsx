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
        axios.get(`/api/budget/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
            .then(response => setBudgets(response.data));
        setEditIdx(null);
    };

    const today = new Date().toISOString().split('T')[0];
    const activeBudgets = budgets.filter(b => b.expiryDate == "" || b.expiryDate >= today);
    const expiredBudgets = budgets.filter(b => b.expiryDate && b.expiryDate < today);

    // Budget card rendering (reuse for both lists)
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
                    maxWidth: 400,
                    margin: '24px auto',
                    background: 'var(--card)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '2px dotted rgb(117, 124, 224)',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                }}
            >
                <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: 8 }}>
                    {budget.category}
                </div>
                <div style={{ color: 'var(--primary)', fontSize: 14, marginBottom: 8 }}>
                    Expiry: {budget.expiryDate || 'N/A'}
                </div>
                <Bar
                    data={data}
                    options={{
                        ...options,
                        elements: {
                            bar: {
                                barThickness: 40
                            }
                        }
                    }}
                    height={60}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text)' }}>
                    <span>Allocated: {budget.currency} {Number(budget.amountAllocated).toFixed(2)}</span>
                    <span>Remaining: {budget.currency} {Number(budget.amount).toFixed(2)}</span>
                </div>
                {editIdx === idx ? (
                    <EditBudget
                        budget={budget}
                        onSave={refreshBudgets}
                        onCancel={() => setEditIdx(null)}
                    />
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                        <button
                            style={{
                                borderColor: 'var(--primary)',
                                borderRadius: 4,
                                padding: '6px 12px',
                                borderWidth: 1,
                                borderStyle: 'solid',
                                cursor: 'pointer'
                            }}
                            onClick={() => setEditIdx(idx)}
                        >
                            Edit
                        </button>
                        <DeleteBudget
                            budgetId={budget.id}
                            onDeleteSuccess={refreshBudgets}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                    onClick={() => setShowExpired(true)}
                    style={{
                        background: 'var(--primary)',
                        color: 'var(--card)',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 18px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                    }}
                >
                    View Expired Budgets
                </button>
            </div>
            <h3 style={{ marginBottom: '20px' }}>Active Budgets (Set in home currency)</h3>
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
                        background: 'rgba(30, 32, 38, 0.85)',
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
                                borderRadius: 6,
                                padding: '8px 18px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginBottom: 16
                            }}
                        >
                            Close
                        </button>
                    </div>
                    <h3 style={{ color: 'var(--card)', marginBottom: 20 }}>Expired Budgets (History)</h3>
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