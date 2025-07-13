import React, { useEffect, useState } from "react";
import axios from "axios";

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
            {visibleBudgets.map(budget => (
                <div key={budget.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 32 }}>
                    <h3>{budget.budgetName}</h3>
                    <div><b>Amount:</b> {budget.amount} {budget.currency}</div>
                    <div><b>Owner:</b> {budget.inviter} ({budget.inviterEmail})</div>
                    <div>
                        <b>Invited Members:</b>
                        <ul>
                            {budget.invites.map((invite, idx) => (
                                <li key={idx}>{invite.username} ({invite.email}) - {invite.status}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}