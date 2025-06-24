import { useState } from "react";
import axios from "axios";
import CurrencyDropdown from "./CurrencyDropdown";

export default function EditBudget({ budget, onSave, onCancel }) {
    const [amount, setAmount] = useState(0.00);
    const [currency, setCurrency] = useState(budget.currency);
    const handleSave = () => {
        axios.put('http://localhost:8080/budget/update', {
            id: budget.id,
            currency: currency,
            amountAllocated: parseFloat(amount) + budget.amountAllocated, // Add the new amount to the existing allocated amount
            amount: parseFloat(amount) + budget.amount
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(() => {
                onSave(); // callback to refresh budgets in parent
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
