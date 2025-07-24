import axios from "axios";
import { useEffect, useState } from "react";
import CurrencyDropdown from "./CurrencyDropdown";
import CategoryFeedback from "./CategoryFeedback";
import React from "react";

export default function AddExpenseForm() {
    const [categories, setCategories] = useState([]);
    const [currency, setCurrency] = useState(localStorage.getItem('currency'));
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctCategory, setCorrectCategory] = useState('');
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD
    });


    useEffect(() => {
        axios.get(`/api/budget/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => {
                console.log('Fetched budgets:', response.data);
                const categories = response.data.map(budget => budget.category);
                setCategories(categories);
            })
            .catch((error) => {
                console.error('Failed to fetch budgets:', error);
            })
    }, []);

    const handleSubmit = (e) => {
        console.log(description, category, currency, date);
        e.preventDefault();
        axios.post('/api/expense/create', {
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
        const description = e.target.value;
        setDescription(description);
        if (description.length > 0) {
            axios.post('/ml/categorize', {
                description: description
            })
                .then(res => {
                    console.log(res.data);
                    if (res.data && res.data.suggested) {
                        setCategory(res.data.suggested);
                        setShowFeedback(true);
                        // If the suggested category is not in the list, add it
                        if (!categories.includes(res.data.suggested)) {
                            setCategories(prevCategories => [...prevCategories, res.data.suggested]);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error categorizing description:', error);
                });
        }
    };

    // changed: improved UI styles
    const theme = {
        primary: '#1976d2',
        accent: '#90caf9',
        card: '#fff',
        dark: '#263859',
        border: '#e3f2fd',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)'
    };


    return (
        <div
            style={{
                background: theme.card,
                borderRadius: 18,
                boxShadow: theme.shadow,
                padding: '32px',
                maxWidth: 420,
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
            }}>
                Add Expense
            </h2>
            <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Name</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        placeholder='Description'
                        value={description}
                        onChange={handleDescriptionChange}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            marginBottom: '8px',
                            outline: 'none'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="category" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Category</label>
                    <select
                        id="category"
                        name="category"
                        required
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                    {showFeedback && category && (
                        <CategoryFeedback
                            description={description}
                            suggestedCategory={category}
                            categories={categories}
                            onAccept={() => setShowFeedback(false)}
                            onCorrection={(correctCat) => {
                                setCategory(correctCat);
                                setShowFeedback(false);
                                if (
                                    correctCat &&
                                    !categories.includes(correctCat)
                                ) {
                                    setCategories(prev => [...prev, correctCat]);
                                }
                            }}
                        />
                    )}
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="currency" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Currency</label>
                    <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Amount</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        placeholder='e.g, 100.00'
                        required
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '18px' }}>
                    <label htmlFor="date" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: theme.dark }}>Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: `1px solid ${theme.border}`,
                            fontSize: 16,
                            outline: 'none'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        backgroundColor: theme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 24px',
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: theme.shadow,
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = theme.dark}
                    onMouseOut={e => e.currentTarget.style.background = theme.primary}
                >
                    Add Expense
                </button>
            </form>
        </div>
    );
}