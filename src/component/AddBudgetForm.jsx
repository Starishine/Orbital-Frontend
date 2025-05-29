import { useState } from 'react';
import '../index.css';
import CurrencyDropdown from './CurrencyDropdown';
import axios from 'axios';

const categories = [
    "Food",
    "Transport",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Health",
    "Education",
    "Others"
];

export default function AddBudgetForm() {
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState(''); // if "Others" is selected, this will be used to enter a custom category
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(localStorage.getItem('currency')); // Default to SGD if no currency is set



    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        if (e.target.value !== "Others") {
            setCustomCategory('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalCategory = category === "Others" ? customCategory : category;
        const currency = localStorage.getItem('currency'); // Default to SGD if no currency is set
        const username = localStorage.getItem('username'); // Get username from localStorage
        alert(`Category: ${finalCategory}\nAmount: ${currency} ${amount}`);

        axios.post('http://localhost:8080/budget/create', {
            username: username,
            category: finalCategory,
            currency: currency,
            amount: parseFloat(amount)
        })
            .then((response) => {
                console.log(response);
                const data = response.data;
                console.log(data);
                if (data.status === "SUCCESS" && data.code === 200) {
                    // alert('Budget added successfully!');
                    // Reset form fields
                    setCategory('');
                    setCustomCategory('');
                    setAmount('');
                    window.location.reload(); // Reload the page to reflect the new budget
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error('Error adding budget:', error);
                alert('An error occurred while adding the budget. Please try again.');
            });

    };



    return (
        <>
            <div className="budget-dotted-container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: 400 }}>
                <h2>Create budget</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="category" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={handleCategoryChange}
                            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                            required
                        >
                            <option value="" disabled>Select category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    {category === "Others" && (
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="customCategory" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                                Enter Category
                            </label>
                            <input
                                id="customCategory"
                                type="text"
                                placeholder='Academic Fees, etc.'
                                autoComplete='on'
                                value={customCategory}
                                onChange={e => setCustomCategory(e.target.value)}
                                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                                required
                            />
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="amount" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
                            Budget Amount
                        </label>
                        <input
                            id="amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder='e.g.,100.00'
                            autoComplete='on'
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Budget
                    </button>
                </form>
            </div>
        </>

    );
}