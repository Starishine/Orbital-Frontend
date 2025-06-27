import axios from "axios";
import { useEffect, useState } from "react";
import CurrencyDropdown from "./CurrencyDropdown";
import CategoryFeedback from "./CategoryFeedback";
import React from "react";

export default function AddExpenseForm() {
    const [categories, setCategories] = useState([]);
    const [currency, setCurrency] = useState(localStorage.getItem('currency'));
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctCategory, setCorrectCategory] = useState('');
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD
    });


    useEffect(() => {
        axios.get(`http://localhost:8080/budget/get`,
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
        axios.post('http://localhost:8080/expense/create', {
            category: category,
            currency: currency,
            amount: parseFloat(e.target.amount.value),
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
            axios.post('http://localhost:8000/categorize', {
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



    return (
        <>
            <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', alignItems: 'center', maxWidth: 400, margin: '0 auto' }}>
                <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', marginTop: '8px' }}>Name</label>
                <input type="text" id="description" name="description" placeholder='Description' value={description} onChange={handleDescriptionChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px' }} />
                <form style={{ maxWidth: '400px', margin: '0 auto' }} onSubmit={handleSubmit} >
                    <div style={{ marginBottom: '16px' }}>
                        <label htmlFor="category" style={{ display: 'block', marginBottom: '8px' }}>Category</label>
                        <select id="category" name="category" required value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
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
                                    // Add to dropdown if not already present and not empty
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
                    <div style={{ marginBottom: '16px' }}>
                        <CurrencyDropdown currency={currency} setCurrency={setCurrency} />
                        <label htmlFor="amount" style={{ display: 'block', marginBottom: '8px' }}>Amount</label>
                        <input type="number" id="amount" name="amount" placeholder='e.g, 100.00' required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
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