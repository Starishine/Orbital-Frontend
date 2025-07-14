import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SharedBudgetDetail() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8080/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setBudgets(res.data);
            setLoading(false);
        });
    }, []);

    const username = localStorage.getItem('username');

    if (loading) return <div>Loading...</div>;
    if (!budgets.length) return <div>No shared budgets found.</div>;

    // Filter budgets: show if owner, or if invitee with accepted status
    const visibleBudgets = budgets.filter(budget =>
        budget.inviter === username ||
        budget.invites.some(invite => invite.username === username && invite.status === "accepted")
    );

    if (!visibleBudgets.length) return <div>No shared budgets to display.</div>;

    return (
        <div>
            <h2>Your Shared Budgets</h2>
            {visibleBudgets.map(budget => {

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
                    <div key={budget.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 32 }}>
                        <h3>{budget.budgetName}</h3>
                        <div><b>Owner:</b> {budget.inviter} ({budget.inviterEmail})</div>
                        <div style={{ margin: '16px 0' }}>
                            <Bar
                                data={data}
                                options={{
                                    ...options,
                                    elements: {
                                        bar: {
                                            barThickness: 30
                                        }
                                    }
                                }}
                                height={60}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--text)' }}>
                                <span>Allocated: {budget.currency} {Number(budget.amountAllocated).toFixed(2)}</span>
                                <span>Remaining: {budget.currency} {Number(budget.amount).toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <b>Invited Members:</b>
                            <ul>
                                {budget.invites.map((invite, idx) => (
                                    <li key={idx}>{invite.username} ({invite.email}) - {invite.status}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}