import React from "react";
import { useState, useEffect } from "react";

// DebtSimplification: Calculates and displays the minimal set of transactions to settle debts among group members
export default function DebtSimplification({ expenses, members }) {
    // Calculate total spent per user
    const spent = {};
    members.forEach(m => spent[m] = 0);
    expenses.forEach(exp => {
        spent[exp.username] = (spent[exp.username] || 0) + Number(exp.amount);
    });

    // Calculate total and fair share per user
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const share = total / members.length;
    const currency = localStorage.getItem('homeCurrency') || 'SGD';

    // Calculate net balance per user (positive: creditor, negative: debtor)
    const net = members.map(m => ({
        username: m,
        balance: +(spent[m] - share).toFixed(2)
    }));

    // Split into creditors and debtors
    let debtors = net.filter(n => n.balance < 0).map(n => ({ ...n }));
    let creditors = net.filter(n => n.balance > 0).map(n => ({ ...n }));

    // Greedy algorithm to minimise number of transactions
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
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)',
            padding: '24px',
            maxWidth: 500,
            marginLeft: 'auto',
            marginRight: 'auto'
        }}>
            {/* Settlement summary title */}
            <h2 style={{
                color: '#1976d2',
                fontWeight: 800,
                fontSize: 24,
                marginBottom: 18,
                textAlign: 'center'
            }}>
                Settlement Summary
            </h2>
            {/* If all settled, show message; else, show transactions */}
            {transactions.length === 0 ? (
                <div style={{ color: '#388e3c', textAlign: 'center' }}>All settled up!</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {transactions.map((t, idx) => (
                        <li key={idx} style={{ marginBottom: 8, fontWeight: 500 }}>
                            <span style={{ color: '#d32f2f' }}>{t.from}</span> <b style={{ color: '#1976d2' }}>owes</b> <span style={{ color: '#388e3c' }}>{t.to}</span> <b style={{ color: '#1976d2' }}>{currency} {t.amount}</b>
                        </li>
                    ))}
                </ul>
            )
            }
        </div >
    );
}