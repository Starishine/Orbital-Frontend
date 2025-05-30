import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ExistingBudget() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }

        axios.get(`http://localhost:8080/budget/get?username=${username}`)
            .then(response => {
                console.log('Fetched budgets:', response.data);
                setBudgets(response.data);
                setLoading(false);
            })
            .catch((error) => {
                setError('Failed to fetch budgets.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading budgets...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <h3 style={{ textAlign: 'right', marginBottom: '20px' }}>Exisiting Budgets</h3>
            {budgets.length === 0 ? (
                <p>No budgets found.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {budgets.map((budget, idx) => (
                        <div
                            key={budget._id || idx}
                            className="budget-dotted-container"
                            style={{
                                float: 'right',
                                width: '300px',
                                margin: '12px',
                                background: '#f5faff',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '2px dottedrgb(0, 0, 0)',
                                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',

                            }}
                        >
                            <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: 4 }}>
                                {budget.category}
                            </div>
                            <div>
                                <span>Amount remaining: </span>
                                <span style={{ color: '#1976d2', fontWeight: 500 }}>
                                    {budget.currency}
                                </span>{' '}
                                {Number(budget.amount).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}