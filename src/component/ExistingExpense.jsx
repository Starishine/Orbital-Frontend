import { useEffect, useState } from 'react';
import axios from 'axios';
import ConvertExpensesToHomeCurrency from './ConvertExpensesToHomeCurrency';
import CurrencyDropdown from './CurrencyDropdown';

export default function ExistingExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [homeCurrency, setHomeCurrency] = useState('SGD'); // Default home currency
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editIdx, setEditIdx] = useState(null); // State to track which budget is being edited
    const [filters, setFilters] = useState({
        category: '',
        name: '',
        amount: '',
        date: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:8080/expense/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then(response => {
                console.log('Fetched expenses:', response.data);
                setExpenses
                    (response.data);
                setLoading(false);
            })
            .catch((error) => {
                setError('Failed to fetch expenses.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading Expenses...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Function to refresh Expenses
    //  after editing
    const refreshExpenses = () => {
        // re-fetch Expenses
        //  after edit so that the UI reflects the latest data
        axios.get(`http://localhost:8080/expense/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

            .then(response => setExpenses(response.data));
        setEditIdx(null);
    };

    // Filtering logic
    const filteredExpenses = expenses.filter(expense =>
        (filters.category === '' || expense.category.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.name === '' || (expense.notes || '').toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.amount === '' || String(expense.amount).includes(filters.amount)) &&
        (filters.date === '' || (expense.date && new Date(expense.date).toLocaleDateString().includes(filters.date)))
    );

    return (
        <div>
            <h3 style={{ marginBottom: '20px' }}>Existing Expenses</h3>
            {expenses.length === 0 ? (
                <p>No Expenses found.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#f5faff' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>
                                Category<br />
                                <input
                                    type="text"
                                    value={filters.category}
                                    onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                                    style={{ width: '90%' }}
                                    placeholder="Filter"
                                />
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>
                                Name<br />
                                <input
                                    type="text"
                                    value={filters.name}
                                    onChange={e => setFilters(f => ({ ...f, name: e.target.value }))}
                                    style={{ width: '90%' }}
                                    placeholder="Filter"
                                />
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>
                                Amount<br />
                                <input
                                    type="text"
                                    value={filters.amount}
                                    onChange={e => setFilters(f => ({ ...f, amount: e.target.value }))}
                                    style={{ width: '90%' }}
                                    placeholder="Filter"
                                />
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>
                                Date<br />
                                <input
                                    type="text"
                                    value={filters.date}
                                    onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
                                    style={{ width: '90%' }}
                                    placeholder="Filter"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense, idx) => (
                            <tr key={expense._id || idx}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{expense.category}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{expense.notes || '-'}</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {expense.currency} {Number(expense.amount).toFixed(2)}
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {expense.date ? new Date(expense.date).toLocaleDateString() : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            )}
            <div style={{ marginBottom: 20, marginTop: 20 }}>
                <CurrencyDropdown currency={homeCurrency} setCurrency={setHomeCurrency} />
            </div>
            <ConvertExpensesToHomeCurrency homeCurrency={homeCurrency} />
        </div>
    );
}