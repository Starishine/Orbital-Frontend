import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';

export default function ForecastConvertedExpenses({ converted }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const homeCurrency = localStorage.getItem('homeCurrency');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }
        axios.get('http://localhost:8080/budget/get', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setBudgets(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch budgets.');
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading forecast...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!converted || converted.length === 0) return <div>No converted expenses to forecast.</div>;

    const today = new Date();

    // Helper to group expenses by interval
    function groupByInterval(expenses, interval) {
        const groups = {};
        expenses.forEach(e => {
            let key = '';
            const date = new Date(e.date);
            if (interval === 'yearly') {
                key = date.getFullYear();
            } else if (interval === 'monthly') {
                key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            } else if (interval === 'weekly') {
                // Week number of year
                const firstDay = new Date(date.getFullYear(), 0, 1);
                const days = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
                key = `${date.getFullYear()}-W${Math.ceil((days + firstDay.getDay() + 1) / 7)}`;
            } else {
                // daily
                key = date.toISOString().slice(0, 10);
            }
            if (!groups[key]) groups[key] = 0;
            groups[key] += Number(e.convertedAmount ?? e.spent ?? e.amount ?? 0);
        });
        return Object.values(groups);
    }

    // Forecast logic per category
    const forecastInfo = budgets.map(budget => {
        const catExpenses = converted.filter(e => e.category === budget.category && e.convertedAmount !== null);
        const spent = catExpenses.reduce((sum, e) => sum + e.convertedAmount, 0);
        const sortedDates = catExpenses.map(e => new Date(e.date)).sort((a, b) => a - b);

        // Heuristic: detect interval
        let interval = 'daily';
        if (sortedDates.length > 1) {
            const diffs = [];
            for (let i = 1; i < sortedDates.length; i++) {
                diffs.push((sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24));
            }
            const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            if (avgDiff > 300) interval = 'yearly';
            else if (avgDiff > 25) interval = 'monthly';
            else if (avgDiff > 6) interval = 'weekly';
        }

        // Calculate average spend per detected interval
        const intervalGroups = groupByInterval(catExpenses, interval);
        const avgPerInterval = intervalGroups.length
            ? intervalGroups.reduce((a, b) => a + b, 0) / intervalGroups.length
            : 0;

        // Forecast intervals left
        let intervalsLeft = Infinity;
        if (avgPerInterval > 0) {
            intervalsLeft = Number(budget.amount) / avgPerInterval;
        }

        // Forecast run out date
        let runOutDate = null;
        if (intervalsLeft !== Infinity && sortedDates.length > 0) {
            let baseDate = today;
            if (interval === 'yearly') {
                runOutDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + intervalsLeft));
            } else if (interval === 'monthly') {
                runOutDate = new Date(baseDate.setMonth(baseDate.getMonth() + intervalsLeft));
            } else if (interval === 'weekly') {
                runOutDate = new Date(baseDate.getTime() + intervalsLeft * 7 * 24 * 60 * 60 * 1000);
            } else {
                runOutDate = new Date(baseDate.getTime() + intervalsLeft * 24 * 60 * 60 * 1000);
            }
        }

        // Progress bar calculation
        const allocated = Number(budget.amountAllocated);
        const percentUsed = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;

        // Interval label
        let intervalLabel = interval === 'yearly' ? 'year'
            : interval === 'monthly' ? 'month'
                : interval === 'weekly' ? 'week'
                    : 'day';

        return {
            category: budget.category,
            intervalLabel,
            avgPerInterval,
            intervalsLeft,
            runOutDate,
            remaining: Number(budget.amount),
            spent,
            allocated,
            percentUsed
        };
    });

    return (
        <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 24, textAlign: 'center' }}>Forecast by Category</h3>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 32,
                justifyContent: 'center',
                alignItems: 'stretch'
            }}>
                {forecastInfo.map(info => (
                    <div
                        key={info.category}
                        style={{
                            minWidth: 380,
                            maxWidth: 380,
                            background: '#fff',
                            color: '#333',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                            borderRadius: 14,
                            padding: 24,
                            marginBottom: 24,
                            borderLeft: info.remaining <= 0 ? '6px solid #d32f2f' : '6px solid #1976d2',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10, color: '#222', textAlign: 'left' }}>
                            {info.category}
                            <span style={{ fontSize: 15, color: '#888', marginLeft: 8 }}>
                                ({homeCurrency})
                            </span>
                        </div>
                        <div style={{ marginBottom: 14, fontSize: 15 }}>
                            <span style={{ color: '#1976d2', fontWeight: 500 }}>Allocated:</span>
                            <span style={{ marginLeft: 6 }}>{homeCurrency} {info.allocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span><br />
                            <span style={{ color: '#d32f2f', fontWeight: 500 }}>Spent:</span>
                            <span style={{ marginLeft: 6 }}>{homeCurrency} {info.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span><br />
                            <span style={{ color: '#388e3c', fontWeight: 500 }}>Remaining:</span>
                            <span style={{ marginLeft: 6 }}>{homeCurrency} {info.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div style={{ margin: '12px 0 18px 0', height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${info.percentUsed}%`,
                                    height: '100%',
                                    background: info.percentUsed > 90 ? '#d32f2f' : '#1976d2',
                                    transition: 'width 0.5s'
                                }}
                            />
                        </div>
                        {info.avgPerInterval > 0 && info.remaining > 0 ? (
                            <div style={{ color: '#333', fontSize: 15, textAlign: 'left' }}>
                                <span role="img" aria-label="forecast">⏳</span> Based on your <b>{info.intervalLabel}</b> spending pattern,
                                if you keep spending at <b>{homeCurrency} {info.avgPerInterval.toLocaleString(undefined, { minimumFractionDigits: 2 })}</b> per {info.intervalLabel},<br />
                                <span>
                                    you’ll run out of budget in <b>{info.intervalsLeft.toFixed(1)}</b> {info.intervalLabel}{info.intervalsLeft > 1 ? 's' : ''}
                                    {info.runOutDate && <> ({info.runOutDate.toLocaleDateString()})</>}
                                </span>
                            </div>
                        ) : info.remaining <= 0 ? (
                            <div style={{ color: '#d32f2f', fontWeight: 600, fontSize: 15, textAlign: 'left' }}>
                                <span role="img" aria-label="alert">⚠️</span> Budget exceeded!
                            </div>
                        ) : (
                            <div style={{ color: 'gray', fontSize: 15, textAlign: 'left' }}>
                                <span role="img" aria-label="info">ℹ️</span> No expenses yet. Forecast not available.
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}