import axios from "axios";
import { useEffect, useState } from "react";
import CurrencyDropdown from "./CurrencyDropdown";
import CategoryFeedback from "./CategoryFeedback";
import React from "react";

export default function AddSharedExpenseForm() {
    const [budget, setBudget] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState(localStorage.getItem('currency'));
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    useEffect(() => {
        axios.get(`/api/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                const username = localStorage.getItem('username');
                const filteredBudgets = response.data.filter(budget =>
                    budget.inviter === username ||
                    (Array.isArray(budget.invites) &&
                        budget.invites.some(invite => invite.username === username && invite.status === "accepted"))
                );
                setBudget(filteredBudgets);

                const budgetNames = filteredBudgets.map(b => b.category);
                setCategories(budgetNames);

                if (budgetNames.length === 1) {
                    setCategory(budgetNames[0]);
                }
            })
            .catch((error) => {
                console.error('Failed to fetch budgets:', error);
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('/api/shared-expense/create', {
            description: description,
            category: category,
            currency: currency,
            amount: parseFloat(amount),
            name: description,
            date: date
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                const data = response.data;
                if (data.status === "SUCCESS" && data.code === 200) {
                    alert('Expense added successfully!');
                    setCategory('');
                    setDescription('');
                    setAmount('');
                    setDate(() => {
                        const today = new Date();
                        return today.toISOString().split('T')[0];
                    });
                    window.location.reload();
                }
            })
            .catch((error) => {
                alert('An error occurred while adding the expense. Please try again.');
            });
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    // changed: improved UI styles to match other components
    const theme = {
        primary: '#1976d2',
        accent: '#90caf9',
        card: '#fff',
        dark: '#263859',
        border: '#e3f2fd',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)'
    };

    return (
        <div
            style={{
                background: theme.card,
                borderRadius: 18,
                boxShadow: theme.shadow,
                padding: '32px',
                maxWidth: 420,
                margin: '0 auto',
                fontFamily: 'Inter, Arial, sans-serif',
                border: `1px solid ${theme.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <h2 style={{
                color: theme.primary,
                fontWeight: 800,
                fontSize: 24,
                marginBottom: 18,
                textAlign: 'center'
            }}>
                Add Shared Expense
            </h2>
            <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Name</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        placeholder='Description'
                        value={description}
                        onChange={handleDescriptionChange}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            marginBottom: '8px',
                            outline: 'none'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="category" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Budget</label>
                    <select
                        id="category"
                        name="category"
                        required
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                        disabled={categories.length === 1}
                    >
                        {categories.map((budgetName, index) => (
                            <option key={index} value={budgetName}>{budgetName}</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder='e.g, 100.00'
                        required
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="date" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        backgroundColor: theme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 24px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: theme.shadow,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.dark}
                    onMouseOut={e => e.currentTarget.style.background = theme.primary}
                >
                    Add Shared Expense
                </button>
            </form>
        </div>
    );
}