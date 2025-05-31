import { useEffect, useState } from 'react';
import axios from 'axios';
import EditBudget from './EditBudget';
import DeleteBudget from './DeleteBudget';

export default function ExistingBudget() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editIdx, setEditIdx] = useState(null); // State to track which budget is being edited

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

    // Function to refresh budgets after editing
    const refreshBudgets = () => {
        // re-fetch budgets after edit so that the UI reflects the latest data
        const username = localStorage.getItem('username');
        axios.get(`http://localhost:8080/budget/get?username=${username}`)
            .then(response => setBudgets(response.data));
        setEditIdx(null);
    };

    return (
        <div>
            <h3 style={{ marginBottom: '20px' }}>Existing Budgets</h3>
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
                                border: '2px dotted rgb(0, 0, 0)',
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
                                {editIdx === idx ? (
                                    <EditBudget
                                        budget={budget}
                                        onSave={refreshBudgets}
                                        onCancel={() => setEditIdx(null)}
                                    />
                                ) : (
                                    <>
                                        {Number(budget.amount).toFixed(2)}
                                        <button
                                            style={{
                                                marginLeft: '12px',
                                                borderColor: 'black'
                                            }}
                                            onClick={() => setEditIdx(idx)}
                                        >
                                            Edit
                                        </button>
                                        <DeleteBudget
                                            budgetId={budget.id}
                                            onDeleteSuccess={refreshBudgets} />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}