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
        // Use budget.createdAt if available, else fallback to 1 day
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

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
            <h2>Expense Distribution by Category ({homeCurrency})</h2>
            <div style={{ maxWidth: 400, margin: '32px auto' }}>
                <h3>Spent by Category</h3>
                <Pie
                    key={pieLabels.join('-') + pieDataValues.join('-')}
                    data={pieData}
                />
            </div>
            <div style={{ marginTop: 32 }}>
                <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
                    <ForecastConvertedExpenses converted={converted} />
                </div>
            </div>
        </div>
    );
}