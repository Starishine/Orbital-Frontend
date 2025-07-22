import axios from "axios";
import { useEffect, useState } from "react";
import React from "react";
import DebtSimplification from "./DebtSimplification";
import VisualisationRing from "./VisualisationRing";

export default function ViewSharedExpenses({ budgetId, inviter, invitees }) {
    const [sharedExpenses, setSharedExpenses] = useState([]);
    const [showHomeCurrency, setShowHomeCurrency] = useState(false);
    const [conversionRates, setConversionRates] = useState({});
    const [loadingRates, setLoadingRates] = useState(false);
    const username = localStorage.getItem('username');
    const homeCurrency = localStorage.getItem('homeCurrency') || 'SGD';

    useEffect(() => {
        if (!budgetId) return;
        axios.get(`/api/shared-expense/get-by-budget?budgetId=${budgetId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => {
                setSharedExpenses(response.data);
            })
            .catch(error => {
                console.error("Error fetching shared expenses:", error);
            });
    }, [budgetId]);

    // Fetch conversion rates when toggling to home currency
    useEffect(() => {
        if (!showHomeCurrency) return;
        const currencies = Array.from(new Set(sharedExpenses.map(e => e.currency))).filter(cur => cur !== homeCurrency);
        if (currencies.length === 0) return;
        setLoadingRates(true);

        Promise.all(
            currencies.map(async cur => {
                // Use exchangerate-api.com for each currency
                const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${cur}`);
                const rateData = await rateRes.json();
                const rate = rateData.rates ? rateData.rates[homeCurrency] : null;
                return { [cur]: rate };
            })
        ).then(results => {
            // Merge all rates into one object
            const rates = results.reduce((acc, obj) => ({ ...acc, ...obj }), {});
            setConversionRates(rates);
            setLoadingRates(false);
        });
    }, [showHomeCurrency, sharedExpenses, homeCurrency]);

    const yourContributions = sharedExpenses.filter(exp => exp.username === username);
    const othersContributions = sharedExpenses.filter(exp => exp.username !== username);

    // Collect all members: inviter + invitees (accepted only)
    const members = inviter
        ? [inviter, ...(invitees ? invitees.filter(i => i.status === "accepted").map(i => i.username) : [])]
        : [];

    // Helper to display amount
    function displayAmount(expense) {
        if (!showHomeCurrency || expense.currency === homeCurrency) {
            return `${expense.currency} ${Number(expense.amount).toFixed(2)}`;
        }
        const rate = conversionRates[expense.currency];
        if (rate) {
            return `${homeCurrency} ${(Number(expense.amount) * rate).toFixed(2)}`;
        }
        return `${expense.currency} ${Number(expense.amount).toFixed(2)} (No rate)`;
    }
    function getConvertedExpenses() {
        return sharedExpenses.map(exp => {
            if (!showHomeCurrency || exp.currency === homeCurrency) {
                return { ...exp, amount: Number(exp.amount) };
            }
            const rate = conversionRates[exp.currency];
            if (rate) {
                return { ...exp, amount: Number(exp.amount) * rate };
            }
            // fallback: use original amount if no rate
            return { ...exp, amount: Number(exp.amount) };
        });
    }
    return (
        <div style={{
            maxWidth: 540,
            width: '100%',
            background: 'var(--card)',
            borderRadius: 16,
            boxShadow: '0 4px 16px rgba(25, 118, 210, 0.10)',
            padding: '36px 28px',
            margin: '0 auto'
        }}>
            <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 28, letterSpacing: 1 }}>Your Shared Expenses</h2>
            <button
                style={{
                    marginBottom: 18,
                    padding: '8px 16px',
                    borderRadius: 6,
                    background: 'var(--primary)',
                    color: 'var(--card)',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
                onClick={() => setShowHomeCurrency(v => !v)}
                disabled={showHomeCurrency && loadingRates}
            >
                {showHomeCurrency
                    ? `Show in Original Currency`
                    : `Show in Home Currency ${homeCurrency}`}
            </button>
            {showHomeCurrency && loadingRates && (
                <div style={{ color: 'var(--primary)', marginBottom: 12 }}>Loading conversion rates...</div>
            )}
            <div style={{
                display: 'flex',
                gap: 24,
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginBottom: 24,
                alignItems: 'stretch'
            }}>
                {/* Your Contributions */}
                <div style={{
                    flex: 1,
                    minWidth: 220,
                    background: '#9fd9f0ff',
                    borderRadius: 10,
                    padding: '18px 14px',
                    marginBottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    <h3 style={{ color: '#388e3c', marginBottom: 10, fontSize: 18 }}>Your Contributions</h3>
                    {yourContributions.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {yourContributions.map(expense => (
                                <li key={expense.id} style={{
                                    background: '#e0f7fa',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    marginBottom: 8,
                                    fontWeight: 500,
                                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)'
                                }}>
                                    <span style={{ color: 'black' }}>{expense.name}</span>
                                    <span style={{ float: 'right', color: '#1976d2' }}>
                                        {displayAmount(expense)}
                                    </span>
                                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{expense.date}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: '#888', fontStyle: 'italic' }}>No contributions yet.</div>
                    )}
                </div>

                {/* Others' Contributions */}
                <div style={{
                    flex: 1,
                    minWidth: 220,
                    background: '#fff3e0',
                    borderRadius: 8,
                    padding: '18px 14px',
                    marginBottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                }}>
                    <h3 style={{ color: '#d32f2f', marginBottom: 10, fontSize: 18 }}>Contributions by Others</h3>
                    {othersContributions.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {othersContributions.map(expense => (
                                <li key={expense.id} style={{
                                    background: '#fff',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    marginBottom: 8,
                                    boxShadow: '0 1px 4px rgba(25, 118, 210, 0.06)'
                                }}>
                                    <b style={{ color: 'black' }}>{expense.username} : </b>
                                    <span style={{ color: 'black' }}>{expense.name}</span>
                                    <span style={{ float: 'right', color: '#d32f2f' }}>
                                        {displayAmount(expense)}
                                    </span>
                                    <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{expense.date}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: '#888', fontStyle: 'italic' }}>No contributions from others yet.</div>
                    )}
                </div>
            </div>
            <DebtSimplification
                expenses={showHomeCurrency ? getConvertedExpenses() : sharedExpenses}
                members={members}
            />
            <VisualisationRing
                expenses={showHomeCurrency ? getConvertedExpenses() : sharedExpenses}
                members={members}
            />
        </div>
    );
}