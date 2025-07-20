import React from "react";
import { useState, useEffect } from "react";

export default function DebtSimplification({ expenses, members }) {
    // Calculate total spent per user
    const spent = {};
    members.forEach(m => spent[m] = 0);
    expenses.forEach(exp => {
        spent[exp.username] = (spent[exp.username] || 0) + Number(exp.amount);
    });

    // Calculate fair share per user
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const share = total / members.length;

    // Calculate net balance per user
    const net = members.map(m => ({
        username: m,
        balance: +(spent[m] - share).toFixed(2)
    }));

    // Split into creditors and debtors
    let debtors = net.filter(n => n.balance < 0).map(n => ({ ...n }));
    let creditors = net.filter(n => n.balance > 0).map(n => ({ ...n }));

    const transactions = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(-debtor.balance, creditor.balance);
        if (amount > 0.01) {
            transactions.push({
                from: debtor.username,
                to: creditor.username,
                amount: amount.toFixed(2)
            });
            debtor.balance += amount;
            creditor.balance -= amount;
        }
        if (Math.abs(debtor.balance) < 0.01) i++;
        if (Math.abs(creditor.balance) < 0.01) j++;
    }

    return (
        <div style={{
            marginTop: 32,
            background: 'var(--card)',
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            padding: '24px',
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto'
        }}>
            <h2 style={{ textAlign: 'center', color: '#1976d2' }}>Settlement Summary</h2>
            {transactions.length === 0 ? (
                <div style={{ color: '#388e3c', textAlign: 'center' }}>All settled up!</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {transactions.map((t, idx) => (
                        <li key={idx} style={{ marginBottom: 8, fontWeight: 500 }}>
                            <span style={{ color: '#d32f2f' }}>{t.from}</span> owes <span style={{ color: '#388e3c' }}>{t.to}</span> <b>${t.amount}</b>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}