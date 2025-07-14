import axios from "axios";
import CurrencyDropdown from "./CurrencyDropdown";
import InviteMembersForm from "./InviteMembersForm";
import { useState } from "react";
import React from "react";

export default function CreateSharedBudgetForm() {
    const [budgetName, setBudgetName] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('SGD');
    const [invites, setInvites] = useState([]);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!budgetName || !amount) {
            setError('Please fill in all fields');
            return;
        }
        axios.post('http://localhost:8080/shared-budget/create', {
            budgetName: budgetName,
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
                    setBudgetName('');
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
        <>
            <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
                <h2>Create Shared Budget</h2>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <input
                    type="text"
                    placeholder="Budget Name"
                    value={budgetName}
                    onChange={(e) => setBudgetName(e.target.value)}
                    required
                />

                <InviteMembersForm invites={invites} setInvites={setInvites} />
                <div style={{ flex: 1 }}>
                    <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                </div>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <button type="submit">Create Budget</button>
            </form>
        </>
    );
}