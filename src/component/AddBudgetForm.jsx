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
    const [customCategory, setCustomCategory] = useState(''); // if "Others" is selected, this will be used to enter a custom category
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(localStorage.getItem('currency')); // Default to SGD if no currency is set
    const [interval, setInterval] = useState('Monthly'); // Default to monthly
    const [customEnd, setCustomEnd] = useState(''); // Custom end date for the budget if needed
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD
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
        const currency = localStorage.getItem('currency'); // Default to SGD if no currency is set

        // Calculate expiry date based on the interval
        let calculatedExpiryDate = '';
        if (interval === 'Weekly') {
            calculatedExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 week from now
        } else if (interval === 'Monthly') {
            calculatedExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 month from now
        } else if (interval === 'Yearly') {
            calculatedExpiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year from now
        } else if (interval === 'Custom' && customEnd) {
            calculatedExpiryDate = customEnd; // Use the custom end date
        }

        axios.post('http://localhost:8080/budget/create', {
            category: finalCategory,
            currency: currency,
            amountAllocated: parseFloat(amount),
            amount: parseFloat(amount),
            interval: interval,
            dateCreated: date,
            expiryDate: calculatedExpiryDate
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                console.log(response);
                const data = response.data;
                console.log(data);
                if (data.status === "SUCCESS" && data.code === 200) {
                    // alert('Budget added successfully!');
                    // Reset form fields
                    setCategory('');
                    setCustomCategory('');
                    setAmount('');
                    setInterval('Monthly'); // Reset to default interval
                    window.location.reload(); // Reload the page to reflect the new budget
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error('Error adding budget:', error);
                alert('An error occurred while adding the budget. Please try again.');
            });

    };



    return (
        <>
            <div className="budget-dotted-container" style={{
                padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: 400, background: 'var(--card)',
                color: 'var(--text)'
            }}>
                <h2>Create budget</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="category" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={handleCategoryChange}
                            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: 'var(--bg)', color: 'var(--text)' }}
                            required
                        >
                            <option value="" disabled>Select category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    {category === "Others" && (
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="customCategory" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
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
                                    width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--primary)', background: 'var(--bg)',
                                    color: 'var(--text)'
                                }}
                                required
                            />
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="amount" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                            Budget Amount
                        </label>
                        <input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder='e.g.,100.00'
                            autoComplete='on'
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{
                                width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--primary)', background: 'var(--bg)',
                                color: 'var(--text)', boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="interval" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                            Budget Interval
                        </label>
                        <select
                            id="interval"
                            value={interval}
                            onChange={e => setInterval(e.target.value)}
                            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: 'var(--bg)', color: 'var(--text)' }}
                            required
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Custom">Custom</option>
                        </select>
                        {interval === 'Custom' && (
                            <div style={{ marginTop: '12px' }}>
                                <label htmlFor="customEnd" style={{ display: 'block', marginBottom: 6, fontWeight: 500, marginTop: '12px' }}>
                                    Custom End Date
                                </label>
                                <input
                                    id="customEnd"
                                    type="date"
                                    value={customEnd}
                                    onChange={e => setCustomEnd(e.target.value)}
                                    style={{
                                        width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--primary)', background: 'var(--bg)',
                                        color: 'var(--text)', boxSizing: 'border-box'
                                    }}
                                    required
                                />
                                <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 4 }}>
                                    Start date will be today: {date}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'var(--primary)',
                            color: 'var(--card)',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Budget
                    </button>
                </form>
            </div>
        </>

    );
}