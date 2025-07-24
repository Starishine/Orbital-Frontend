import { useState } from 'react';
import axios from 'axios';
import React from "react";

export default function ConvertExpensesToHomeCurrency({ homeCurrency }) {
    const [loading, setLoading] = useState(false);
    const [converted, setConverted] = useState([]);
    const [error, setError] = useState('');

    const theme = {
        primary: '#1976d2',
        accent: '#90caf9',
        card: '#fff', // Always white, like in shared expenses
        dark: '#263859',
        border: '#e3f2fd',
        shadow: '0 4px 24px rgba(25, 118, 210, 0.10)',
        text: '#222',
        inputBg: '#f5f5f5'
    };

    const handleConvert = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch all expenses
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/expense/get', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const expenses = res.data;

            // Convert each expense to home currency
            const conversions = await Promise.all(expenses.map(async (exp) => {
                if (exp.currency === homeCurrency) return { ...exp, convertedAmount: exp.amount };
                // Call a currency conversion API (replace with your own or a backend endpoint)
                const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/${exp.currency}`);
                const rateData = await rateRes.json();
                const rate = rateData.rates[homeCurrency];
                const convertedAmount = rate ? (Number(exp.amount) * rate) : null;
                return { ...exp, convertedAmount };
            }));

            setConverted(conversions);
            localStorage.setItem('convertedExpenses', JSON.stringify(conversions));
            localStorage.setItem('homeCurrency', homeCurrency);
        } catch (err) {
            setError('Conversion failed.');
        }
        setLoading(false);
    };

    return (
        <div
            style={{
                background: theme.card,
                borderRadius: 18,
                boxShadow: theme.shadow,
                padding: '32px',
                maxWidth: 1000,
                margin: '0 auto',
                fontFamily: 'Inter, Arial, sans-serif',
                border: `1px solid ${theme.border}`,
                color: theme.text
            }}
        >
            <button
                onClick={handleConvert}
                disabled={loading}
                style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 28px',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                    marginBottom: 16,
                    transition: 'background 0.2s'
                }}
            >
                {loading ? 'Converting...' : 'Convert All Expenses to Home Currency'}
            </button>
            {error && <div style={{ color: '#d32f2f', marginBottom: 12 }}>{error}</div>}
            {converted.length > 0 && (
                <table
                    style={{
                        marginTop: 8,
                        width: '100%',
                        borderCollapse: 'collapse',
                        background: '#fff',
                        borderRadius: 12,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.04)'
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{
                                padding: '14px 12px',
                                background: '#e3f2fd',
                                color: '#1976d2',
                                textAlign: 'left',
                                fontWeight: 700,
                                borderBottom: '2px solid #1976d2'
                            }}>Category</th>
                            <th style={{
                                padding: '14px 12px',
                                background: '#e3f2fd',
                                color: '#1976d2',
                                textAlign: 'left',
                                fontWeight: 700,
                                borderBottom: '2px solid #1976d2'
                            }}>Description</th>
                            <th style={{
                                padding: '14px 12px',
                                background: '#e3f2fd',
                                color: '#1976d2',
                                textAlign: 'left',
                                fontWeight: 700,
                                borderBottom: '2px solid #1976d2'
                            }}>Original Amount</th>
                            <th style={{
                                padding: '14px 12px',
                                background: '#e3f2fd',
                                color: '#1976d2',
                                textAlign: 'left',
                                fontWeight: 700,
                                borderBottom: '2px solid #1976d2'
                            }}>Converted Amount ({homeCurrency})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {converted.map((exp, idx) => (
                            <tr key={exp._id || idx}
                                style={{
                                    background: idx % 2 === 0 ? '#fff' : '#f8fafd'
                                }}>
                                <td style={{
                                    padding: '12px 12px',
                                    textAlign: 'left',
                                    borderBottom: '1px solid #e3f2fd'
                                }}>{exp.category}</td>
                                <td style={{
                                    padding: '12px 12px',
                                    textAlign: 'left',
                                    borderBottom: '1px solid #e3f2fd'
                                }}>{exp.name || '-'}</td>
                                <td style={{
                                    padding: '12px 12px',
                                    textAlign: 'left',
                                    borderBottom: '1px solid #e3f2fd'
                                }}>{exp.currency} {Number(exp.amount).toFixed(2)}</td>
                                <td style={{
                                    padding: '12px 12px',
                                    textAlign: 'left',
                                    borderBottom: '1px solid #e3f2fd'
                                }}>
                                    {exp.convertedAmount !== null
                                        ? `${homeCurrency} ${exp.convertedAmount.toFixed(2)}`
                                        : <span style={{ color: '#d32f2f' }}>Conversion failed</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}