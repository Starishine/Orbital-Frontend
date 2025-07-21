import axios from "axios";
import CurrencyDropdown from "./CurrencyDropdown";
import InviteMembersForm from "./InviteMembersForm";
import { useState } from "react";
import React from "react";

export default function CreateSharedBudgetForm() {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('SGD');
    const [invites, setInvites] = useState([]);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category || !amount) {
            setError('Please fill in all fields');
            return;
        }
        axios.post('http://localhost:8080/shared-budget/create', {
            category: category,
            amountAllocated: parseFloat(amount),
            amount: parseFloat(amount),
            currency: currency,
            invites: invites,
            inviter: localStorage.getItem('username') || 'User',
            inviterEmail: localStorage.getItem('email') || 'No email provided'
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                const data = response.data;
                if (data.status === "SUCCESS" && data.code === 200) {
                    console.log('Shared budget created:', data.data);
                    alert('Shared budget created successfully!');
                    setCategory('');
                    setAmount('');
                    setCurrency('SGD');
                    setError('');
                    setInvites([]);
                    window.location.reload(); // Reload the page to reflect the new budget

                } else {
                    setError(data.message || 'Failed to create shared budget');
                }

            })
            .catch((error) => {
                console.error('Error creating shared budget:', error);
                setError('An error occurred while creating the shared budget. Please try again.');
            });
    };

    return (
        <div style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            maxWidth: 400,
            background: 'var(--card)',
            color: 'var(--text)',
            borderRadius: 'var(--round-md)',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
        }}>
            <h2>Create Shared Budget</h2>
            <form onSubmit={handleSubmit}>
                {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="category" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                        Budget Name
                    </label>
                    <input
                        id="category"
                        type="text"
                        placeholder="e.g. Trip to Japan"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                            width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', background: 'var(--bg)', color: 'var(--text)'
                        }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                        Invite Members
                    </label>
                    <InviteMembersForm invites={invites} setInvites={setInvites} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="amount" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                        Amount
                    </label>
                    <input
                        id="amount"
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{
                            width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--primary)', background: 'var(--bg)', color: 'var(--text)'
                        }}
                        required
                    />
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
                    Create Budget
                </button>
            </form>
        </div>
    );
}