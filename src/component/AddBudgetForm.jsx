import { useState } from 'react';
import '../index.css';
import CurrencyDropdown from './CurrencyDropdown';
import axios from 'axios';
import React from "react";

const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Health",
    "Education",
    "Others"
];

export default function AddBudgetForm() {
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(localStorage.getItem('currency'));
    const [interval, setInterval] = useState('Monthly');
    const [customEnd, setCustomEnd] = useState('');
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    // Detect dark mode from localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';

    // Theme to match AddSharedExpenseForm
    const theme = {
        primary: '#1976d2',
        accent: '#90caf9',
        card: '#fff',
        dark: '#263859',
        border: '#e3f2fd',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)'
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        if (e.target.value !== "Others") {
            setCustomCategory('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalCategory = category === "Others" ? customCategory : category;
        const currency = localStorage.getItem('currency');

        let calculatedExpiryDate = '';
        if (interval === 'Weekly') {
            calculatedExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (interval === 'Monthly') {
            calculatedExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (interval === 'Yearly') {
            calculatedExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (interval === 'Custom' && customEnd) {
            calculatedExpiryDate = customEnd;
        }

        axios.post('/api/budget/create', {
            category: finalCategory,
            currency: currency,
            amountAllocated: parseFloat(amount),
            amount: parseFloat(amount),
            interval: interval,
            dateCreated: date,
            expiryDate: calculatedExpiryDate
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                const data = response.data;
                if (data.status === "SUCCESS" && data.code === 200) {
                    setCategory('');
                    setCustomCategory('');
                    setAmount('');
                    setInterval('Monthly');
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            })
            .catch(() => {
                alert('An error occurred while adding the budget. Please try again.');
            });
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
                <span role="img" aria-label="budget">💰</span> Create Budget
            </h2>
            <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                {/* Category Section */}
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="category" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: theme.dark
                    }}>
                        Category
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={handleCategoryChange}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                        required
                    >
                        <option value="" disabled>Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                {category === "Others" && (
                    <div style={{ marginBottom: '18px' }}>
                        <label htmlFor="customCategory" style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: 600,
                            color: theme.dark
                        }}>
                            Enter Category
                        </label>
                        <input
                            id="customCategory"
                            type="text"
                            placeholder='Academic Fees, etc.'
                            autoComplete='on'
                            value={customCategory}
                            onChange={e => setCustomCategory(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: 8,
                                border: `1px solid ${theme.primary}`,
                                fontSize: 16,
                                outline: 'none'
                            }}
                            required
                        />
                    </div>
                )}
                {/* Currency Section */}
                <div style={{ marginBottom: '18px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: theme.dark
                    }}>
                        Currency
                    </label>
                    <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                </div>
                {/* Amount Section */}
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="amount" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: theme.dark
                    }}>
                        Budget Amount
                    </label>
                    <input
                        id="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder='e.g., 100.00'
                        autoComplete='on'
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.primary}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                        required
                    />
                </div>
                {/* Interval Section */}
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="interval" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: theme.dark
                    }}>
                        Budget Interval
                    </label>
                    <select
                        id="interval"
                        value={interval}
                        onChange={e => setInterval(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                        required
                    >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Custom">Custom</option>
                    </select>
                    {interval === 'Custom' && (
                        <div style={{ marginTop: '12px' }}>
                            <label htmlFor="customEnd" style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: 600,
                                color: theme.dark
                            }}>
                                Custom End Date
                            </label>
                            <input
                                id="customEnd"
                                type="date"
                                value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    border: `1px solid ${theme.primary}`,
                                    fontSize: 16,
                                    outline: 'none'
                                }}
                                required
                            />
                            <div style={{ fontSize: 13, color: theme.primary, marginTop: 4 }}>
                                Start date will be today: {date}
                            </div>
                        </div>
                    )}
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
                        transition: 'background 0.2s',
                        width: '100%',
                        marginTop: 8
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.dark}
                    onMouseOut={e => e.currentTarget.style.background = theme.primary}
                >
                    ➕ Add Budget
                </button>
            </form>
        </div>
    );
}