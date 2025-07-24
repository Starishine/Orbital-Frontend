import { useState } from "react";
import axios from "axios";
import CurrencyDropdown from "./CurrencyDropdown";
import React from "react";

export default function EditBudget({ budget, onSave, onCancel }) {
    const [amount, setAmount] = useState(0.00);
    const [currency, setCurrency] = useState(budget.currency);
    const [interval, setInterval] = useState(budget.interval);
    const [customEnd, setCustomEnd] = useState(budget.expiryDate || ''); // Custom end date for the budget if needed

    // Function to convert currency using an API
    async function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
        const data = await res.json();
        const rate = data.rates[toCurrency];
        if (!rate) throw new Error('Conversion rate not found');
        return amount * rate;
    }

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

        newAmountAllocated += topUpAmount;
        newAmount += topUpAmount;

        // Calculate new expiry date based on the interval, with start date as today
        let newExpiryDate = '';
        const today = new Date();
        if (interval === 'Weekly') {
            newExpiryDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (interval === 'Monthly') {
            newExpiryDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];
        } else if (interval === 'Yearly') {
            newExpiryDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
        } else if (interval === 'Custom' && customEnd) {
            newExpiryDate = customEnd;
        }


        axios.put('/api/budget/update', {
            id: budget.id,
            currency: currency,
            amountAllocated: newAmountAllocated,
            amount: newAmount,
            interval: interval,
            expiryDate: newExpiryDate,
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(() => {
                onSave();
            })
            .catch(() => alert('Failed to update budget.'));
    };

    return (
        <div
            style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
                padding: '28px 24px',
                maxWidth: 380,
                margin: '18px auto',
                border: '1px solid #e3f2fd',
                fontFamily: 'Inter, Arial, sans-serif',
                color: '#263859',
                display: 'flex',
                flexDirection: 'column',
                gap: 18
            }}
        >
            <h3 style={{
                fontWeight: 800,
                fontSize: 20,
                color: '#1976d2',
                marginBottom: 8,
                textAlign: 'center'
            }}>
                Edit Budget
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontWeight: 600, minWidth: 90 }}>Top up Amount:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{
                        width: 90,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #1976d2',
                        fontSize: 15,
                        marginRight: 8
                    }}
                />
                <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontWeight: 600, minWidth: 90 }}>Interval:</label>
                <select
                    value={interval}
                    onChange={e => setInterval(e.target.value)}
                    style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #1976d2',
                        fontSize: 15
                    }}
                >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                </select>
            </div>
            {interval === "Custom" && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ fontWeight: 600, minWidth: 90 }}>End Date:</label>
                    <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: '1px solid #1976d2',
                            fontSize: 15
                        }}
                    />
                </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button
                    onClick={handleSave}
                    style={{
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                        transition: 'background 0.2s'
                    }}
                >
                    Save
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        backgroundColor: '#d32f2f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 24px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                        transition: 'background 0.2s'
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}