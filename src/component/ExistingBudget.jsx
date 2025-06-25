import { useEffect, useState } from 'react';
import axios from 'axios';
import EditBudget from './EditBudget';
import DeleteBudget from './DeleteBudget';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ExistingBudget() {
    const [budgets, setBudgets] = useState([]);
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

        axios.get(`http://localhost:8080/budget/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
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
        axios.get(`http://localhost:8080/budget/get`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
            .then(response => setBudgets(response.data));
        setEditIdx(null);
    };



    return (
        <div>
            <h3 style={{ marginBottom: '20px' }}>Existing Budgets (Set in home currency)</h3>
            {budgets.map((budget, idx) => {
                const spent = budget.amountAllocated - budget.amount;
                const data = {
                    labels: [''],
                    datasets: [
                        {
                            label: 'Spent',
                            data: [spent],
                            backgroundColor: '#d32f2f',
                        },
                        {
                            label: 'Remaining',
                            data: [budget.amount],
                            backgroundColor: '#388e3c',
                        },
                    ],
                };
                const options = {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        tooltip: { enabled: true },
                    },
                    scales: {
                        x: {
                            stacked: true,
                            min: 0,
                            max: budget.amountAllocated,
                            ticks: {
                                callback: value => `${budget.currency} ${Number(value).toFixed(2)}`
                            }
                        },
                        y: { stacked: true }
                    }
                };

                return (
                    <div
                        key={budget._id || idx}
                        style={{
                            width: '100%',
                            maxWidth: 400,
                            margin: '24px auto',
                            background: '#f5faff',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '2px dotted rgb(0, 0, 0)',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)',
                        }}
                    >
                        <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: 8 }}>
                            {budget.category}
                        </div>
                        <Bar
                            data={data}
                            options={{
                                ...options,
                                elements: {
                                    bar: {
                                        barThickness: 40 // Increase this value for thicker bars
                                    }
                                }
                            }}
                            height={60} // Increase height for a thicker appearance
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                            <span>Allocated: {budget.currency} {Number(budget.amountAllocated).toFixed(2)}</span>
                            <span>Remaining: {budget.currency} {Number(budget.amount).toFixed(2)}</span>
                        </div>
                        {editIdx === idx ? (
                            <EditBudget
                                budget={budget}
                                onSave={refreshBudgets}
                                onCancel={() => setEditIdx(null)}
                            />
                        ) : (
                            <>
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
                                    onDeleteSuccess={refreshBudgets}
                                />
                            </>
                        )}
                    </div>
                );
            })}
        </div >
    );
}