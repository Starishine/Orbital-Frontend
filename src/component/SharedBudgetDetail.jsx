import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from 'react-chartjs-2';
import ViewSharedExpenses from './ViewSharedExpenses';
import EditSharedBudgetForm from './EditSharedBudget';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// SharedBudgetDetail: Displays details of a selected shared budget 
// Allows editing of budget name, top-up amount, and currency only for the owner
export default function SharedBudgetDetail({ selectedBudgetId, setSelectedBudgetId }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Fetch all shared budgets
    useEffect(() => {
        axios.get(`/api/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setBudgets(res.data);
            setLoading(false);
        });
    }, []);

    const username = localStorage.getItem('username');

    // Only show budgets where user is owner or accepted invitee
    const visibleBudgets = budgets.filter(budget =>
        budget.inviter === username ||
        (Array.isArray(budget.invites) &&
            budget.invites.some(invite => invite.username === username && invite.status === "accepted"))
    );

    // If only one visible budget, auto-select it
    useEffect(() => {
        if (visibleBudgets.length === 1) {
            setSelectedBudgetId(visibleBudgets[0].id);
        }
    }, [visibleBudgets, setSelectedBudgetId]);

    if (loading) return <div>Loading...</div>;
    if (!budgets.length) return <div>No shared budgets found.</div>;
    if (!visibleBudgets.length) return <div>No shared budgets to display.</div>;

    // Find the selected budget object
    const selectedBudget =
        visibleBudgets.length === 1
            ? visibleBudgets[0]
            : visibleBudgets.find(budget => budget.id === selectedBudgetId);

    // Refresh budgets after editing
    const onSave = () => {
        axios.get(`/api/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setBudgets(res.data);
            setLoading(false);
        });
    };

    return (
        <div
            style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                padding: '32px',
                maxWidth: 500,
                margin: '0 auto',
                fontFamily: 'Inter, Arial, sans-serif',
                border: '1px solid #e3f2fd',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            {/* Title */}
            <h2 style={{
                color: '#1976d2',
                fontWeight: 800,
                fontSize: 24,
                marginBottom: 18,
                textAlign: 'center'
            }}>
                Your Shared Budgets
            </h2>
            {/* Budget selector if multiple budgets */}
            {visibleBudgets.length > 1 && (
                <div style={{ marginBottom: '18px', width: '100%' }}>
                    <label htmlFor="budget-select" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: '#263859'
                    }}>
                        Select Budget
                    </label>
                    <select
                        id="budget-select"
                        value={selectedBudgetId}
                        onChange={e => setSelectedBudgetId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #e3f2fd',
                            fontSize: 16,
                            background: '#f5f5f5',
                            color: '#263859'
                        }}
                    >
                        <option value="">-- Choose a budget --</option>
                        {visibleBudgets.map(budget => (
                            <option key={budget.id} value={budget.id}>
                                {budget.category}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* Selected budget details */}
            {selectedBudget && (
                <>
                    <div
                        key={selectedBudget.id}
                        style={{
                            border: '1px solid #e3f2fd',
                            borderRadius: 14,
                            padding: 24,
                            marginBottom: 32,
                            background: '#f8fafd',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.06)',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Budget name */}
                        <h3 style={{
                            color: '#1976d2',
                            fontWeight: 700,
                            fontSize: 20,
                            marginBottom: 8,
                            textAlign: 'center'
                        }}>
                            {selectedBudget.category}
                        </h3>
                        {/* Owner info */}
                        <div style={{
                            color: '#263859',
                            marginBottom: 8,
                            textAlign: 'center',
                            fontSize: 16,
                            fontWeight: 500
                        }}>
                            <b>Owner:</b> {selectedBudget.inviter} ({selectedBudget.inviterEmail})
                        </div>
                        {/* Budget progress bar */}
                        <div style={{ margin: '16px 0', width: '100%' }}>
                            {/* DO NOT TOUCH BAR */}
                            {/* Bar chart code remains unchanged */}
                            <Bar
                                data={{
                                    labels: [''],
                                    datasets: [
                                        {
                                            label: 'Spent',
                                            data: [selectedBudget.amountAllocated - selectedBudget.amount],
                                            backgroundColor: '#d32f2f',
                                        },
                                        {
                                            label: 'Remaining',
                                            data: [selectedBudget.amount],
                                            backgroundColor: '#388e3c',
                                        },
                                    ],
                                }}
                                options={{
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
                                            max: selectedBudget.amountAllocated,
                                            ticks: {
                                                callback: value => `${selectedBudget.currency} ${Number(value).toFixed(2)}`
                                            }
                                        },
                                        y: { stacked: true }
                                    },
                                    elements: {
                                        bar: {
                                            barThickness: 30
                                        }
                                    }
                                }}
                                height={60}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: 8,
                                color: '#263859',
                                fontWeight: 600,
                                fontSize: 15,
                                width: '100%'
                            }}>
                                <span>Allocated: {selectedBudget.currency} {Number(selectedBudget.amountAllocated).toFixed(2)}</span>
                                <span>Remaining: {selectedBudget.currency} {Number(selectedBudget.amount).toFixed(2)}</span>
                            </div>
                        </div>
                        {/* Invited members list */}
                        <div style={{ marginTop: 16, width: '100%' }}>
                            <b style={{ color: '#263859', fontWeight: 600 }}>Invited Members</b>
                            <div style={{
                                marginTop: 8,
                                border: '1px solid #e0e0e0',
                                borderRadius: 8,
                                background: '#fff',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    fontWeight: 600,
                                    background: '#f5f5f5',
                                    color: '#263859',
                                    padding: '8px 16px',
                                    borderBottom: '1px solid #e0e0e0',
                                    fontSize: 15
                                }}>
                                    <div style={{ flex: 2 }}>Name</div>
                                    <div style={{ flex: 3 }}>Email</div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>Status</div>
                                </div>
                                {(Array.isArray(selectedBudget.invites) ? selectedBudget.invites : []).map((invite, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px 16px',
                                            borderBottom: idx !== selectedBudget.invites.length - 1 ? '1px solid #f0f0f0' : 'none',
                                            fontSize: 15,
                                            background: idx % 2 === 0 ? '#f8fafd' : '#fff'
                                        }}
                                    >
                                        <div style={{ flex: 2, color: '#263859' }}>{invite.username}</div>
                                        <div style={{ flex: 3, color: '#888' }}>{invite.email}</div>
                                        <div style={{
                                            flex: 1,
                                            textAlign: 'center',
                                            color: invite.status === "accepted" ? "#388e3c" : "#d32f2f",
                                            fontWeight: 500
                                        }}>
                                            {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Edit button for owner */}
                        {username === selectedBudget.inviter && (
                            <button
                                style={{
                                    width: '100%',
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '12px 24px',
                                    fontWeight: 700,
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    marginTop: '18px',
                                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#263859'}
                                onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                                onClick={() => setEditing(true)}
                            >
                                Edit Shared Budget
                            </button>
                        )}
                        {/* Edit form modal */}
                        {editing && (
                            <EditSharedBudgetForm
                                budget={selectedBudget}
                                onSave={() => { setEditing(false); onSave(); }}
                                onCancel={() => setEditing(false)}
                            />
                        )}
                    </div>
                    {/* Shared expenses section */}
                    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24, width: '100%' }}>
                        <ViewSharedExpenses
                            budgetId={selectedBudget.id}
                            inviter={selectedBudget.inviter}
                            invitees={selectedBudget.invites}
                        />
                    </div>
                </>
            )}
        </div>
    );

}