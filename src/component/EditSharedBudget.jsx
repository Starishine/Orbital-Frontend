import { useState } from "react";
import axios from "axios";
import CurrencyDropdown from "./CurrencyDropdown";
import React from "react";

// EditSharedBudget: Form to edit a shared budget's name, top-up amount, and currency
export default function EditSharedBudget({ budget, onSave, onCancel }) {
    const [budgetName, setBudgetName] = useState(budget.category);
    const [amount, setAmount] = useState(0.00);
    const [currency, setCurrency] = useState(budget.currency);

    // Function to convert currency using an API
    async function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await res.json();
        const rate = data.rates[toCurrency];
        if (!rate) throw new Error('Conversion rate not found');
        return amount * rate;
    }

    // Handle save: update shared budget with new values and currency conversion if needed
    const handleSave = async () => {
        let topUpAmount = parseFloat(amount);
        let newAmountAllocated = budget.amountAllocated;
        let newAmount = budget.amount;

        // If currency changed, convert the top-up amount to the budget's original currency
        if (currency !== budget.currency) {
            try {
                newAmountAllocated = await convertCurrency(budget.amountAllocated, budget.currency, currency);
                newAmount = await convertCurrency(budget.amount, budget.currency, currency);
            } catch (e) {
                alert('Currency conversion failed.');
                return;
            }
        }

        // Add top-up to both allocated and available amounts
        newAmountAllocated += topUpAmount;
        newAmount += topUpAmount;

        try {
            // Send update request to backend
            await axios.put('/api/shared-budget/update', {
                id: budget.id,
                category: budgetName,
                amountAllocated: newAmountAllocated,
                amount: newAmount,
                currency: currency
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            onSave();
        } catch (e) {
            alert('Failed to update shared budget');
            console.error('Error updating shared budget:', e);
        }
    };

    return (
        <div
            style={{
                border: '1px solid #e3f2fd',
                borderRadius: 14,
                padding: 24,
                marginBottom: 32,
                background: '#f8fafd',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.06)',
                width: '100%',
                maxWidth: 500,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: 'Inter, Arial, sans-serif'
            }}
        >
            {/* Title */}
            <h2 style={{
                color: '#1976d2',
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
                textAlign: 'center'
            }}>Edit Shared Budget</h2>
            {/* Edit form */}
            <form style={{ width: '100%' }} onSubmit={e => { e.preventDefault(); handleSave(); }}>
                {/* Budget name input */}
                <div style={{ marginBottom: '18px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: '#263859'
                    }}>
                        Budget Name
                    </label>
                    <input
                        type="text"
                        value={budgetName}
                        onChange={e => setBudgetName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #e3f2fd',
                            fontSize: 16,
                            outline: 'none'
                        }}
                    />
                </div>
                {/* Top up amount input */}
                <div style={{ marginBottom: '18px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: '#263859'
                    }}>
                        Top up Amount
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #1976d2',
                            fontSize: 16,
                            outline: 'none'
                        }}
                    />
                </div>
                {/* Currency dropdown */}
                <div style={{ marginBottom: '18px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: 600,
                        color: '#263859'
                    }}>
                        Currency
                    </label>
                    <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                </div>
                {/* save and cancel buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                    <button
                        type="submit"
                        style={{
                            flex: 1,
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 24px',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#263859'}
                        onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            backgroundColor: '#d32f2f',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 24px',
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#263859'}
                        onMouseOut={e => e.currentTarget.style.background = '#d32f2f'}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}