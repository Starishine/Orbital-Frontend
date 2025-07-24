import { useEffect, useState } from 'react';
import axios from 'axios';
import ConvertExpensesToHomeCurrency from './ConvertExpensesToHomeCurrency';
import CurrencyDropdown from './CurrencyDropdown';
import React from 'react';

export default function ExistingExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editIdx, setEditIdx] = useState(null);
    const homeCurrency = localStorage.getItem('homeCurrency') || 'SGD';
    const [filters, setFilters] = useState({
        category: '',
        name: '',
        amount: '',
        date: ''
    });

     const darkMode = localStorage.getItem('darkMode') === 'true';
    const theme = {
        primary: '#1976d2',
        accent: '#90caf9',
        card: '#fff', // Always white, like in shared expenses
        dark: '#263859',
        border: '#e3f2fd',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
        text: '#222',
        inputBg: '#f5f5f5'
    };


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }

        axios.get(`/api/expense/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => {
                setExpenses(response.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch expenses.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading Expenses...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    const refreshExpenses = () => {
        axios.get(`/api/expense/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => {
                setExpenses(response.data);
            });
        setEditIdx(null);
    };

    // Filtering logic
    const filteredExpenses = expenses.filter(expense => {
        const categoryMatch = filters.category.length === 0 || filters.category.includes(expense.category);
        const nameMatch = filters.name === '' || (expense.notes || '').toLowerCase().includes(filters.name.toLowerCase());
        const amountMatch = filters.amount === '' || String(expense.amount).includes(filters.amount);
        const expenseDate = expense.date ? new Date(expense.date) : null;
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        const dateMatch = (!startDate || (expenseDate && expenseDate >= startDate)) &&
            (!endDate || (expenseDate && expenseDate <= endDate));

        return categoryMatch && nameMatch && amountMatch && dateMatch;
    });

    const uniqueCategories = Array.from(new Set(expenses.map(expense => expense.category)));

    return (
        <div
            style={{
                background: theme.card,
                borderRadius: 18,
                boxShadow: theme.shadow,
                padding: '32px',
                maxWidth: 900,
                margin: '0 auto',
                fontFamily: 'Inter, Arial, sans-serif',
                border: `1px solid ${theme.border}`,
                color: theme.text
            }}
        >
            <h3 style={{
                marginBottom: '20px',
                fontWeight: 800,
                fontSize: 24,
                letterSpacing: 1,
                color: theme.primary,
                textAlign: 'left'
            }}>
                Existing Expenses
            </h3>
            {expenses.length === 0 ? (
                <p style={{ color: theme.text }}>No Expenses found.</p>
            ) : (
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        background: theme.card,
                        color: theme.text,
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{
                                border: `1px solid ${theme.primary}`,
                                padding: '8px',
                                background: theme.inputBg,
                                color: theme.primary
                            }}>
                                Category<br />
                                <select
                                    value={filters.category}
                                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                                    style={{
                                        width: '90%',
                                        background: theme.inputBg,
                                        color: theme.text,
                                        border: `1px solid ${theme.primary}`,
                                        borderRadius: 4,
                                        padding: 4
                                    }}
                                >
                                    <option value="">All</option>
                                    {uniqueCategories.map((category, idx) => (
                                        <option key={idx} value={category}>{category}</option>
                                    ))}
                                </select>
                            </th>
                            <th style={{
                                border: `1px solid ${theme.primary}`,
                                padding: '8px',
                                background: theme.inputBg,
                                color: theme.primary
                            }}>
                                Name<br />
                                <input
                                    type="text"
                                    value={filters.name}
                                    onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
                                    style={{
                                        width: '90%',
                                        background: theme.inputBg,
                                        color: theme.text,
                                        border: `1px solid ${theme.primary}`,
                                        borderRadius: 4,
                                        padding: 4
                                    }}
                                    placeholder="Filter"
                                />
                            </th>
                            <th style={{
                                border: `1px solid ${theme.primary}`,
                                padding: '8px',
                                background: theme.inputBg,
                                color: theme.primary
                            }}>
                                Amount<br />
                                <input
                                    type="text"
                                    value={filters.amount}
                                    onChange={e => setFilters(f => ({ ...f, amount: e.target.value }))}
                                    style={{
                                        width: '90%',
                                        background: theme.inputBg,
                                        color: theme.text,
                                        border: `1px solid ${theme.primary}`,
                                        borderRadius: 4,
                                        padding: 4
                                    }}
                                    placeholder="Filter"
                                />
                            </th>
                            <th style={{
                                border: `1px solid ${theme.primary}`,
                                padding: '8px',
                                background: theme.inputBg,
                                color: theme.primary
                            }}>
                                Date<br />
                                <input
                                    type="date"
                                    value={filters.startDate || ''}
                                    onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
                                    style={{
                                        width: '44%',
                                        marginRight: '2%',
                                        background: theme.inputBg,
                                        color: theme.text,
                                        border: `1px solid ${theme.primary}`,
                                        borderRadius: 4,
                                        padding: 4
                                    }}
                                    placeholder="Start"
                                />
                                <input
                                    type="date"
                                    value={filters.endDate || ''}
                                    onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
                                    style={{
                                        width: '44%',
                                        background: theme.inputBg,
                                        color: theme.text,
                                        border: `1px solid ${theme.primary}`,
                                        borderRadius: 4,
                                        padding: 4
                                    }}
                                    placeholder="End"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense, idx) => (
                            <tr key={expense._id || idx}>
                                <td style={{
                                    border: `1px solid ${theme.primary}`,
                                    padding: '8px'
                                }}>{expense.category}</td>
                                <td style={{
                                    border: `1px solid ${theme.primary}`,
                                    padding: '8px'
                                }}>{expense.name || '-'}</td>
                                <td style={{
                                    border: `1px solid ${theme.primary}`,
                                    padding: '8px'
                                }}>
                                    {expense.currency} {Number(expense.amount).toFixed(2)}
                                </td>
                                <td style={{
                                    border: `1px solid ${theme.primary}`,
                                    padding: '8px'
                                }}>
                                    {expense.date ? new Date(expense.date).toLocaleDateString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <ConvertExpensesToHomeCurrency homeCurrency={homeCurrency} />
        </div>
    );
}