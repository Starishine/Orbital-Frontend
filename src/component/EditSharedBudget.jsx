import { useState } from "react";
import axios from "axios";
import CurrencyDropdown from "./CurrencyDropdown";
import React from "react";

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

        try {
            await axios.put('http://localhost:8080/shared-budget/update', {
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
        <div style={{ margin: '16px 0', padding: 16, background: 'var(--card)', borderRadius: 8 }}>
            <h4>Edit Shared Budget</h4>
            <div>
                <label>Budget Name:</label>
                <input
                    type="text"
                    value={budgetName}
                    onChange={e => setBudgetName(e.target.value)}
                    style={{ marginLeft: 8, marginBottom: 8 }}
                />
            </div>
            <div>
                <label>Top up Amount:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    style={{ marginLeft: 8, marginBottom: 8 }}
                />
            </div>
            <div>
                <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
            </div>
            <button onClick={handleSave}
                style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 16px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginRight: '8px'
                }}>Save</button>
            <button onClick={onCancel}
                style={{
                    backgroundColor: '#888',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 16px',
                    fontWeight: 500,
                    cursor: 'pointer'
                }}>Cancel</button>
        </div>
    );
}