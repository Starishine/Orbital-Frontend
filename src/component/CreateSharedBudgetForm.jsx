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

    // Theme to match AddSharedExpenseForm/AddBudgetForm
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const theme = {
        primary: '#1976d2',
        accent: '#90caf9',
        card: '#fff',
        dark: '#263859',
        border: '#e3f2fd',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)'
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category || !amount) {
            setError('Please fill in all fields');
            return;
        }
        axios.post('/api/shared-budget/create', {
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
        <div
            style={{
                background: theme.card,
                borderRadius: 18,
                boxShadow: theme.shadow,
                padding: '32px',
                maxWidth: 500,
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
            }}>Create Shared Budget</h2>

            <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="category" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: theme.dark
                    }}>
                        Budget Name
                    </label>
                    <input
                        id="category"
                        type="text"
                        placeholder="e.g. Trip to Japan"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: theme.dark
                    }}>
                        Invite Members
                    </label>
                    <InviteMembersForm invites={invites} setInvites={setInvites} />
                </div>
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
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="amount" style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: theme.dark
                    }}>
                        Amount
                    </label>
                    <input
                        id="amount"
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
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
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '12px 24px',
                        background: theme.primary,
                        color: theme.card,
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: theme.shadow,
                        transition: 'background 0.2s',
                        marginTop: 8
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.dark}
                    onMouseOut={e => e.currentTarget.style.background = theme.primary}
                >
                    Create Budget
                </button>
            </form>
        </div>
    );
}