import { useState } from "react";
import axios from "axios";
import CurrencyDropdown from "./CurrencyDropdown";

export default function EditBudget({ budget, onSave, onCancel }) {
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

        axios.put('http://localhost:8080/budget/update', {
            id: budget.id,
            currency: currency,
            amountAllocated: newAmountAllocated,
            amount: newAmount
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
            </div>
        </>
    );

}
