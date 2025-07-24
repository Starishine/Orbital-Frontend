import { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import ForecastConvertedExpenses from './ForecastConvertedExpenses';
Chart.register(ArcElement, Tooltip, Legend);
import React from "react";

export default function BudgetForecast() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [converted, setConverted] = useState([]);
    const homeCurrency = localStorage.getItem('homeCurrency');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }
        // Fetch converted expenses from localStorage
        const stored = localStorage.getItem('convertedExpenses');
        if (stored) {
            setConverted(JSON.parse(stored));
        }

        axios.get(`/api/budget/get`, { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {
                setBudgets(response.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch budgets.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading forecast...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    // Pie chart : sum of converted expenses by category for visualisation 
    const categoryTotals = {};
    converted.forEach(item => {
        if (!item.category) return;
        if (!categoryTotals[item.category]) categoryTotals[item.category] = 0;
        categoryTotals[item.category] += Number(item.convertedAmount);
    });
    const pieLabels = Object.keys(categoryTotals);
    const pieDataValues = Object.values(categoryTotals)
    const pieColors = [
        '#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b', '#ffa000', '#388e3c', '#455a64',
        '#8d6e63', '#00bcd4', '#e91e63', '#ff5722', '#607d8b'
    ];

    const pieData = {
        labels: pieLabels,
        datasets: [
            {
                data: pieDataValues,
                backgroundColor: pieLabels.map((_, idx) => pieColors[idx % pieColors.length]),
                borderWidth: 1,
            }
        ]
    };

    // Forecast logic: for each budget, estimate days left at current spending rate
    const today = new Date();
    const forecastInfo = budgets.map(budget => {
        const spent = Number(budget.amountAllocated) - Number(budget.amount);
        const createdAt = budget.createdAt ? new Date(budget.createdAt) : today;
        const daysElapsed = Math.max(1, Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24)));
        const dailyRate = spent / daysElapsed;
        const daysLeft = dailyRate > 0 ? Number(budget.amount) / dailyRate : Infinity;
        const runOutDate = daysLeft !== Infinity
            ? new Date(today.getTime() + daysLeft * 24 * 60 * 60 * 1000)
            : null;
        return {
            category: budget.category,
            currency: budget.currency,
            dailyRate,
            daysLeft,
            runOutDate,
            remaining: Number(budget.amount),
            spent
        };
    });

    // Theme to match AddExpenseForm
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
                maxWidth: 700,
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
                Expense Distribution by Category ({homeCurrency})
            </h2>
            <div style={{
                maxWidth: 400,
                width: '100%',
                margin: '32px auto',
                background: '#f5f5f5',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
            }}>
                <h3 style={{
                    color: theme.dark,
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 16,
                    textAlign: 'center'
                }}>Spent by Category</h3>
                <Pie
                    key={pieLabels.join('-') + pieDataValues.join('-')}
                    data={pieData}
                />
            </div>
            <div style={{
                marginTop: 32,
                width: '100%'
            }}>
                <div style={{
                    background: '#f5f5f5',
                    borderRadius: 12,
                    padding: 24,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                }}>
                    <ForecastConvertedExpenses converted={converted} />
                </div>
            </div>
        </div>
    );
}