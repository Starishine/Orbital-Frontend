import { useState } from 'react';
import axios from 'axios';
import React from "react";

export default function ConvertExpensesToHomeCurrency({ homeCurrency }) {
    const [loading, setLoading] = useState(false);
    const [converted, setConverted] = useState([]);
    const [error, setError] = useState('');

    const handleConvert = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch all expenses
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/expense/get', {
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
        <div style={{ margin: 24, padding: 16, border: '1px solid #ccc', borderRadius: 8 }}>
            <button onClick={handleConvert} disabled={loading}>
                {loading ? 'Converting...' : 'Convert All Expenses to Home Currency'}
            </button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {converted.length > 0 && (
                <table style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Original Amount</th>
                            <th>Converted Amount ({homeCurrency})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {converted.map((exp, idx) => (
                            <tr key={exp._id || idx}>
                                <td>{exp.category}</td>
                                <td>{exp.notes || '-'}</td>
                                <td>{exp.currency} {Number(exp.amount).toFixed(2)}</td>
                                <td>
                                    {exp.convertedAmount !== null
                                        ? `${homeCurrency} ${exp.convertedAmount.toFixed(2)}`
                                        : 'Conversion failed'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}