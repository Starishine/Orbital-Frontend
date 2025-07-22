import axios from "axios";
import { useEffect, useState } from "react";
import CurrencyDropdown from "./CurrencyDropdown";
import CategoryFeedback from "./CategoryFeedback";
import React from "react";

export default function AddExpenseForm() {
    const [budget, setBudget] = useState([]);
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState('');
    const [currency, setCurrency] = useState(localStorage.getItem('currency'));
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    useEffect(() => {
        axios.get(`/api/shared-budget/get`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                // Filter budgets where the user is either the inviter or an accepted invitee
                const username = localStorage.getItem('username');
                const filteredBudgets = response.data.filter(budget =>
                    budget.inviter === username ||
                    (Array.isArray(budget.invites) &&
                        budget.invites.some(invite => invite.username === username && invite.status === "accepted"))
                );
                setBudget(filteredBudgets);

                // Extract budget names
                const budgetNames = filteredBudgets.map(b => b.category);
                setCategories(budgetNames);

                // Autofill category if only one budget
                if (budgetNames.length === 1) {
                    setCategory(budgetNames[0]);
                }
            })
            .catch((error) => {
                console.error('Failed to fetch budgets:', error);
            });
    }, []);

    const handleSubmit = (e) => {
        console.log(description, category, currency, date);
        e.preventDefault();
        axios.post('/api/shared-expense/create', {
            description: description,
            category: category,
            currency: currency,
            amount: parseFloat(amount),
            name: description,
            date: date
        }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                console.log(response);
                const data = response.data;
                console.log(data);
                if (data.status === "SUCCESS" && data.code === 200) {
                    alert('Expense added successfully!');
                    // Reset form fields
                    setCategory('');
                    setDescription('');
                    setAmount('');
                    setDate(() => {
                        const today = new Date();
                        return today.toISOString().split('T')[0];
                    });
                    window.location.reload(); // Reload the page to reflect the new expense
                }
            })
            .catch((error) => {
                console.error('Error adding expense:', error);
                alert('An error occurred while adding the expense. Please try again.');
            });
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    return (
        <>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', alignItems: 'center', maxWidth: 400, margin: '0 auto' }}>
                <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', marginTop: '8px' }}>Name</label>
                <input type="text" id="description" name="description" placeholder='Description' value={description} onChange={handleDescriptionChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px' }} />
                <form style={{ maxWidth: '400px', margin: '0 auto' }} onSubmit={handleSubmit} >
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="category" style={{ display: 'block', marginBottom: '8px' }}>Budget</label>
                        <select
                            id="category"
                            name="category"
                            required
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            disabled={categories.length === 1}
                        >
                            {categories.map((budgetName, index) => (
                                <option key={index} value={budgetName}>{budgetName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                        <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px' }}>Amount</label>
                        <input type="number" id="amount" name="amount" placeholder='e.g, 100.00' required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} value={amount} onChange={e => setAmount(e.target.value)} />
                        <label htmlFor="date" style={{ display: 'block', marginBottom: '8px', marginTop: '8px' }}>Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '8px' }}
                        />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 16px', fontWeight: 500, cursor: 'pointer' }}>Add Expense</button>
                </form>
            </div>
        </>
    );
}