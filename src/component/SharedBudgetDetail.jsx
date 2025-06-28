import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SharedBudgetDetail() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState({});
    const [newExpense, setNewExpense] = useState({});
    const [splitSummary, setSplitSummary] = useState({});

    useEffect(() => {
        axios.get(`http://localhost:8080/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setBudgets(res.data);
            setLoading(false);
        });
    }, []);

    // Fetch expenses for each budget
    useEffect(() => {
        budgets.forEach(budget => {
            axios.get(`http://localhost:8080/shared-budget/${budget.id}/expenses`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }).then(res => {
                setExpenses(prev => ({ ...prev, [budget.id]: res.data }));
            });
        });
    }, [budgets]);

    // Calculate split summary for each budget
    useEffect(() => {
        budgets.forEach(budget => {
            const exp = expenses[budget.id] || [];
            const members = budget.invites.map(i => i.username);
            // Simple equal split
            const total = exp.reduce((sum, e) => sum + e.amount, 0);
            const perPerson = members.length ? total / members.length : 0;
            const paid = {};
            members.forEach(m => paid[m] = 0);
            exp.forEach(e => { paid[e.paidBy] += e.amount; });
            const balances = {};
            members.forEach(m => { balances[m] = paid[m] - perPerson; });
            setSplitSummary(prev => ({ ...prev, [budget.id]: balances }));
        });
    }, [expenses, budgets]);

    const handleExpenseChange = (budgetId, field, value) => {
        setNewExpense(prev => ({
            ...prev,
            [budgetId]: { ...prev[budgetId], [field]: value }
        }));
    };

    const handleAddExpense = (budgetId, members) => {
        const exp = newExpense[budgetId];
        if (!exp || !exp.amount || !exp.paidBy || !exp.description) return;
        axios.post(`http://localhost:8080/shared-budget/${budgetId}/expense`, exp, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => {
            setExpenses(prev => ({
                ...prev,
                [budgetId]: [...(prev[budgetId] || []), res.data]
            }));
            setNewExpense(prev => ({ ...prev, [budgetId]: {} }));
        });
    };

    if (loading) return <div>Loading...</div>;
    if (!budgets.length) return <div>No shared budgets found.</div>;

    return (
        <div>
            <h2>Your Shared Budgets</h2>
            {budgets.map(budget => (
                <div key={budget.id} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBottom: 32 }}>
                    <h3>{budget.budgetName}</h3>
                    <div><b>Amount:</b> {budget.amount} {budget.currency}</div>
                    <div>
                        <b>Invited Members:</b>
                        <ul>
                            {budget.invites.map((invite, idx) => (
                                <li key={idx}>{invite.username} ({invite.email})</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4>Expenses</h4>
                        <ul>
                            {(expenses[budget.id] || []).map((exp, idx) => (
                                <li key={idx}>
                                    {exp.description}: {exp.amount} ({exp.paidBy})
                                </li>
                            ))}
                        </ul>
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                handleAddExpense(budget.id, budget.invites.map(i => i.username));
                            }}
                            style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}
                        >
                            <input
                                type="text"
                                placeholder="Description"
                                value={newExpense[budget.id]?.description || ""}
                                onChange={e => handleExpenseChange(budget.id, "description", e.target.value)}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={newExpense[budget.id]?.amount || ""}
                                onChange={e => handleExpenseChange(budget.id, "amount", e.target.value)}
                                required
                            />
                            <select
                                value={newExpense[budget.id]?.paidBy || ""}
                                onChange={e => handleExpenseChange(budget.id, "paidBy", e.target.value)}
                                required
                            >
                                <option value="">Paid By</option>
                                {budget.invites.map((invite, idx) => (
                                    <option key={idx} value={invite.username}>{invite.username}</option>
                                ))}
                            </select>
                            <button type="submit">Add Expense</button>
                        </form>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <h4>Split Summary</h4>
                        <ul>
                            {splitSummary[budget.id] &&
                                Object.entries(splitSummary[budget.id]).map(([user, balance]) => (
                                    <li key={user}>
                                        {user}: {balance > 0 ? `is owed ${balance.toFixed(2)}` : `owes ${(-balance).toFixed(2)}`}
                                    </li>
                                ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}