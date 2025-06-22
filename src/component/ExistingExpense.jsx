import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExistingExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editIdx, setEditIdx] = useState(null); // State to track which budget is being edited

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

    return (
        <div>
            {expenses.length === 0 ? (
                <p>No Expenses found.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {expenses
                        .map((expenses, idx) => (
                            <div
                                key={expenses._id || idx}
                                className="budget-dotted-container"
                                style={{
                                    float: 'right',
                                    width: '300px',
                                    margin: '12px',
                                    background: '#f5faff',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '2px dotted rgb(0, 0, 0)',
                                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',

                                }}
                            >
                                <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: 4 }}>
                                    Category : {expenses.category}
                                </div>
                                <div>
                                    <span>Amount spent: </span>
                                    <span style={{ color: '#1976d2', fontWeight: 500 }}>
                                        {expenses.currency} {Number(expenses.amount).toFixed(2)}
                                    </span>{' '}
                                    <p>Notes: {expenses.notes} </p>
                                    <p> Date: {expenses.date} </p>

                                </div>
                            </div>
                        ))}
                </div>
            )
            }
        </div >
    );
}