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
        <>
            <div>
                <p style={{
                    display: 'inline-block',
                    marginRight: '8px',
                }} >Top up Amount: </p>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{ width: '80px', marginRight: '8px' }}
                />
                <CurrencyDropdown currency={currency} setCurrency={setCurrency}></CurrencyDropdown>
            </div>
            <div style={{ marginBottom: 8 }}>
                <label style={{ marginRight: 8 }}>Adjust Interval:</label>
                <select
                    value={interval}
                    onChange={e => setInterval(e.target.value)}
                    style={{ padding: 4, borderRadius: 4, border: '1px solid var(--primary)' }}
                >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom</option>
                </select>
            </div>
            {interval === "Custom" && (
                <div style={{ marginBottom: 8 }}>
                    <label style={{ marginRight: 8 }}>Custom End Date:</label>
                    <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        style={{ padding: 4, borderRadius: 4, border: '1px solid var(--primary)' }}
                    />
                </div>
            )}
            <button onClick={handleSave}
                style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 16px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginLeft: '8px'
                }}>Save</button>
            <button onClick={onCancel} style={{
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 16px',
                fontWeight: 500,
                cursor: 'pointer',
                marginLeft: '8px'
            }}>Cancel</button>
        </>
    );

}
