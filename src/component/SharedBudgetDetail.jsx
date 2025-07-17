import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from 'react-chartjs-2';
import ViewSharedExpenses from './ViewSharedExpenses';
import EditSharedBudgetForm from './EditSharedBudget';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SharedBudgetDetail({ selectedBudgetId, setSelectedBudgetId }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:8080/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setBudgets(res.data);
            setLoading(false);
        });
    }, []);

    const username = localStorage.getItem('username');

    // Filter budgets: show if owner, or if invitee with accepted status
    const visibleBudgets = budgets.filter(budget =>
        budget.inviter === username ||
        budget.invites.some(invite => invite.username === username && invite.status === "accepted")
    );

    useEffect(() => {
        if (visibleBudgets.length === 1) {
            setSelectedBudgetId(visibleBudgets[0].id);
        }
    }, [visibleBudgets]);

    if (loading) return <div>Loading...</div>;
    if (!budgets.length) return <div>No shared budgets found.</div>;
    if (!visibleBudgets.length) return <div>No shared budgets to display.</div>;

    // Find the selected budget object
    const selectedBudget =
        visibleBudgets.length === 1
            ? visibleBudgets[0]
            : visibleBudgets.find(budget => budget.id === selectedBudgetId);

    const onSave = () => {
        axios.get(`http://localhost:8080/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setBudgets(res.data);
            setLoading(false);
        });
    };

    return (
        <>
            <div>
                <h2>Your Shared Budgets</h2>
                {visibleBudgets.length > 1 && (
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="budget-select"><b>Select Budget:</b></label>
                        <select
                            id="budget-select"
                            value={selectedBudgetId}
                            onChange={e => setSelectedBudgetId(e.target.value)}
                            style={{ marginLeft: '8px', padding: '4px 8px', borderRadius: '4px' }}
                        >
                            <option value="">-- Choose a budget --</option>
                            {visibleBudgets.map(budget => (
                                <option key={budget.id} value={budget.id}>
                                    {budget.budgetName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {selectedBudget && (
                    <>
                        <div key={selectedBudget.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 32 }}>
                            <h3>{selectedBudget.budgetName}</h3>
                            <div><b>Owner:</b> {selectedBudget.inviter} ({selectedBudget.inviterEmail})</div>
                            <div style={{ margin: '16px 0' }}>
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text)' }}>
                                    <span>Allocated: {selectedBudget.currency} {Number(selectedBudget.amountAllocated).toFixed(2)}</span>
                                    <span>Remaining: {selectedBudget.currency} {Number(selectedBudget.amount).toFixed(2)}</span>
                                </div>
                            </div>
                            <div>
                                <b>Invited Members:</b>
                                <ul>
                                    {selectedBudget.invites.map((invite, idx) => (
                                        <li key={idx}>{invite.username} ({invite.email}) - {invite.status}</li>
                                    ))}
                                </ul>
                            </div>
                            {username === selectedBudget.inviter && (
                                <button
                                    style={{
                                        backgroundColor: '#1976d2',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '6px 16px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        marginTop: '12px'
                                    }}
                                    onClick={() => setEditing(true)}
                                >
                                    Edit Shared Budget
                                </button>
                            )}
                            {editing && (
                                <EditSharedBudgetForm
                                    budget={selectedBudget}
                                    onSave={() => { setEditing(false); onSave(); }}
                                    onCancel={() => setEditing(false)}
                                />
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                            <ViewSharedExpenses
                                budgetId={selectedBudget.id}
                                inviter={selectedBudget.inviter}
                                invitees={selectedBudget.invites}
                            />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}