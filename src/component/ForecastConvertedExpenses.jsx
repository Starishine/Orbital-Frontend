import { use, useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';

export default function ForecastConvertedExpenses({ converted }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mlSuggestions, setMlSuggestions] = useState([]);
    const [openInsights, setOpenInsights] = useState({});
    const homeCurrency = localStorage.getItem('homeCurrency');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            setLoading(false);
            return;
        }
        axios.get('/api/budget/get', {
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
        const budgetduration = budget.duration || 'monthly'; // Default to monthly if not set

        // detect interval
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


        // Streak Calculation
        let streak = 0;
        if (intervalGroups.length > 0 && allocated > 0) {
            // Go from most recent interval to oldest
            for (let i = intervalGroups.length - 1; i >= 0; i--) {
                // Stayed under budget for this interval
                if (intervalGroups[i] <= allocated) {
                    streak++;
                } else {
                    // Broke the streak
                    break;
                }
            }
        }

        return {
            category: budget.category,
            budgetduration,
            intervalLabel,
            avgPerInterval,
            intervalsLeft,
            runOutDate,
            remaining: Number(budget.amount),
            spent,
            allocated,
            percentUsed,
            streak,
        };
    });

    // For ML insights, prepare data
    const mlBudgets = forecastInfo.map(info => ({
        category: info.category,
        budgetduration: info.budgetduration,
        allocated: info.allocated,
        spent: info.spent,
        currency: homeCurrency,
        spendinginterval: info.intervalLabel,
        percent_used: info.percentUsed,
        streak: info.streak
    }));

    useEffect(() => {
        if (mlBudgets.length > 0) {
            axios.post('http://localhost:8000/insights', mlBudgets)
                .then(res => {
                    // Transform insights to cardSuggestions format
                    const insights = (res.data.insights || []).map(insight => ({
                        category: insight.category,
                        type: insight.prediction,
                        message: generateInsightMessage(insight)
                    }));
                    console.log('ML Insights:', insights);
                    setMlSuggestions(insights);
                })
                .catch(() => setMlSuggestions([{ message: 'Could not fetch ML insights.' }]));
        }
    }, [JSON.stringify(mlBudgets)]);

    // Helper to generate a user-friendly message
    function generateInsightMessage(insight) {
        switch (insight.prediction) {
            case "overspending":
                return `⚠️ Careful! Your spending in "${insight.category}" is higher than usual. Consider reviewing your expenses to stay within budget.`;
            case "saving":
                return `💡 Great job! You're consistently saving more than expected in "${insight.category}". Keep up the good work!`;
            case "underspending":
                return `ℹ️ You are spending less than your < 50% of your allocated budget in "${insight.category}". If this is intentional, fantastic!`;
            case "warning":
                return `⚠️ Warning: Your spending in "${insight.category}" is approaching the budget limit.`;
            case "invalid_budget":
                return `⚠️ Allocated budget is zero. Please set a positive budget amount for meaningful insights.`;
            default:
                return `Insight for "${insight.category}": ${insight.prediction}`;
        }
    }

    if (loading) return <div>Loading forecast...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!converted || converted.length === 0) return <div>No converted expenses to forecast.</div>;


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
                {forecastInfo.map(info => {
                    // Filter ML suggestions for this category
                    const cardSuggestions = mlSuggestions.filter(
                        s => (s.category || '').toLowerCase() === info.category.toLowerCase()
                    );
                    return (
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
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                                <div style={{ fontWeight: 700, fontSize: 20, color: '#222', textAlign: 'left', flex: 1 }}>
                                    {info.category}
                                    <span style={{ fontSize: 15, color: '#888', marginLeft: 8 }}>
                                        ({homeCurrency})
                                    </span>
                                </div>
                                {/* Lightbulb icon button for ML suggestions */}
                                {cardSuggestions.length > 0 && (
                                    <button
                                        onClick={() =>
                                            setOpenInsights(prev => ({
                                                ...prev,
                                                [info.category]: !prev[info.category]
                                            }))
                                        }
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 22,
                                            marginLeft: 8,
                                            color: openInsights[info.category] ? '#1976d2' : '#bbb'
                                        }}
                                        title={openInsights[info.category] ? "Hide Insights" : "Show Insights"}
                                    >
                                        <span role="img" aria-label="lightbulb">💡</span>
                                    </button>
                                )}
                            </div>
                            <div style={{ marginBottom: 14, fontSize: 15 }}>
                                <span style={{ color: '#1976d2', fontWeight: 500 }}>Allocated:</span>
                                <span style={{ marginLeft: 6 }}>{homeCurrency} {info.allocated.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span><br />
                                <span style={{ color: '#d32f2f', fontWeight: 500 }}>Spent:</span>
                                <span style={{ marginLeft: 6 }}>{homeCurrency} {info.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span><br />
                                <span style={{ color: '#388e3c', fontWeight: 500 }}>Remaining:</span>
                                <span style={{ marginLeft: 6 }}>{homeCurrency} {info.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ margin: '12px 0 18px 0', height: 12, background: '#eee', borderRadius: 6, overflow: 'true' }}>
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
                            {/* Insights section for ML suggestions */}
                            {cardSuggestions.length > 0 && openInsights[info.category] && (
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                                        <span role="img" aria-label="lightbulb" style={{ fontSize: 22, marginRight: 6 }}>💡</span>
                                        Insights
                                        {info.streak > 0 && (
                                            <span style={{ marginLeft: 16, fontSize: 15, color: '#388e3c', fontWeight: 500 }}>
                                                🏆 Streak: {info.streak} day{info.streak > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {cardSuggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    background: '#f5faff',
                                                    borderLeft: '4px solid #1976d2',
                                                    borderRadius: 8,
                                                    padding: '10px 14px',
                                                    color: '#222',
                                                    fontSize: 15,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)'
                                                }}
                                            >
                                                <span>{s.message ? s.message : s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}