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
        <div className="budget-form-card" style={{
            boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)', // changed: increased shadow for modern card look
            borderRadius: 16, // changed: more rounded corners
            padding: '32px 24px', // changed: more padding for spacious feel
            background: 'var(--card)',
            color: 'var(--text)',
            maxWidth: 420,
            margin: '0 auto',
            fontFamily: 'Inter, Arial, sans-serif',
            position: 'relative',
            transition: 'box-shadow 0.2s',
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: 24,
                fontWeight: 700,
                fontSize: 28, // changed: larger heading
                letterSpacing: 1
            }}>
                <span role="img" aria-label="budget">💰</span> Create Budget {/* changed: added emoji for heading */}
            </h2>
            <form onSubmit={handleSubmit}>
                {/* Category Section */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="category" style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 600 }}>
                        <span role="img" aria-label="category" style={{ marginRight: 8 }}>📂</span> Category {/* changed: added emoji for category */}
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={handleCategoryChange}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #bdbdbd', background: 'var(--bg)', color: 'var(--text)', fontSize: 16 }} // changed: improved input style
                        required
                    >
                        <option value="" disabled>Select category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                {category === "Others" && (
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="customCategory" style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 600 }}>
                            <span role="img" aria-label="custom">📝</span> Enter Category {/* changed: added emoji for custom category */}
                        </label>
                        <input
                            id="customCategory"
                            type="text"
                            placeholder='Academic Fees, etc.'
                            autoComplete='on'
                            value={customCategory}
                            onChange={e => setCustomCategory(e.target.value)}
                            style={{
                                width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--bg)',
                                color: 'var(--text)', fontSize: 16 // changed: improved input style
                            }}
                            required
                        />
                    </div>
                )}
                {/* Currency Section */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 600 }}>
                        <span role="img" aria-label="currency" style={{ marginRight: 8 }}>💱</span> Currency {/* changed: added emoji for currency */}
                    </label>
                    <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                </div>
                {/* Amount Section */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="amount" style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 600 }}>
                        <span role="img" aria-label="amount" style={{ marginRight: 8 }}>💵</span> Budget Amount {/* changed: added emoji for amount */}
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
                            width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--bg)',
                            color: 'var(--text)', fontSize: 16 // changed: improved input style
                        }}
                        required
                    />
                </div>
                {/* Interval Section */}
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="interval" style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 600 }}>
                        <span role="img" aria-label="interval" style={{ marginRight: 8 }}>⏰</span> Budget Interval {/* changed: added emoji for interval */}
                    </label>
                    <select
                        id="interval"
                        value={interval}
                        onChange={e => setInterval(e.target.value)}
                        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #bdbdbd', background: 'var(--bg)', color: 'var(--text)', fontSize: 16 }} // changed: improved input style
                        required
                    >
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="Custom">Custom</option>
                    </select>
                    {interval === 'Custom' && (
                        <div style={{ marginTop: '12px' }}>
                            <label htmlFor="customEnd" style={{ display: 'flex', alignItems: 'center', marginBottom: 8, fontWeight: 600 }}>
                                <span role="img" aria-label="date" style={{ marginRight: 8 }}>📅</span> Custom End Date {/* changed: added emoji for custom end date */}
                            </label>
                            <input
                                id="customEnd"
                                type="date"
                                value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                                style={{
                                    width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--primary)', background: 'var(--bg)',
                                    color: 'var(--text)', fontSize: 16 // changed: improved input style
                                }}
                                required
                            />
                            <div style={{ fontSize: 13, color: 'var(--primary)', marginTop: 4 }}>
                                Start date will be today: {date}
                            </div>
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--primary)', // changed: button color and style
                        color: 'var(--card)',
                        border: 'none',
                        borderRadius: 8, // changed: rounded button
                        fontWeight: 700,
                        fontSize: 18,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)', // changed: button shadow
                        transition: 'background 0.2s', // changed: smooth hover transition
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--primary-dark)'} // changed: button hover effect
                    onMouseOut={e => e.currentTarget.style.background = 'var(--primary)'} // changed: button hover effect
                >
                    ➕ Add Budget {/* changed: added emoji to button */}
                </button>
            </form>
        </div>
    );
}