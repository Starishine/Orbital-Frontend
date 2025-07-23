import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import BudgetBannerNotification from "./BudgetBannerNotifications";
import NotificationBell from "./NotificationBell";

export default function BudgetBannerManager({ banner, setBanner }) {
    const [bannerIdx, setBannerIdx] = useState(0);

    useEffect(() => {
        let intervalId;

        async function fetchBudgets() {
            try {
                const token = localStorage.getItem('token');
                const [budgetRes, expenseRes, sharedRes] = await Promise.all([
                    axios.get('/api/budget/get', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('/api/expense/get', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('/api/shared-budget/get-by-user', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                const budgets = budgetRes.data || [];
                const expenses = expenseRes.data || [];
                const sharedBudgets = sharedRes.data || [];
                const today = new Date();

                // Collect all types of banner notifications
                const banners = [];

                // Low budget
                budgets.forEach(b => {
                    const allocated = Number(b.amountAllocated) || 0;
                    const amount = Number(b.amount) || 0;
                    if (allocated > 0 && (amount / allocated) < 0.2) {
                        banners.push(`Low Budget Alert: Only ${b.currency || ''} ${amount.toFixed(2)} left in your ${b.category || 'Unknown'} budget!`);
                    }
                });

                // Expiry and fully spent
                budgets.forEach(b => {
                    if (!b.expiryDate) return;
                    const expiryDate = new Date(b.expiryDate);
                    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                    if (daysUntilExpiry < 0) {
                        banners.push(`Budget for ${b.category} has expired.`);
                    } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 5) {
                        banners.push(`Budget for ${b.category} expires in ${daysUntilExpiry} days.`);
                    }
                    if (b.amount <= 0) {
                        banners.push(`Budget for ${b.category} has been fully spent.`);
                    }
                });

                // Expense reminders
                if (expenses && expenses.length > 0) {
                    const lastExpenseDate = new Date(expenses.map(exp => new Date(exp.date)).sort((a, b) => b - a)[0]);
                    console.log('Last expense date:', lastExpenseDate);
                    const today = new Date();

                    // Remove time from dates for comparison
                    lastExpenseDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    const daysSinceLastExpense = Math.ceil((today - lastExpenseDate) / (1000 * 60 * 60 * 24));
                    console.log('Days since last expense:', daysSinceLastExpense);

                    if (daysSinceLastExpense == 1) {
                        banners.push('No expenses logged for today.');
                    } else if (daysSinceLastExpense > 1) {
                        banners.push(`No expenses logged for the last ${daysSinceLastExpense} days.`);
                    }
                } else {
                    banners.push('No expenses logged yet.');
                }

                // Shared budgets
                if (sharedBudgets && sharedBudgets.length > 0) {
                    sharedBudgets.forEach(sharedBudget => {
                        if (sharedBudget.amount <= 0) {
                            banners.push(`Shared budget ${sharedBudget.budgetName} has been fully spent.`);
                        }
                    });
                }

                // Dismiss logic
                if (sessionStorage.getItem('bannerDismissed') === 'true') {
                    setBanner([]);
                } else {
                    setBanner(banners);
                }
            } catch (e) {
                // Optionally show error banner
                // setBanner(['Could not fetch budgets.']);
            }
        }

        fetchBudgets();
        // Fetch every 5 minutes
        intervalId = setInterval(fetchBudgets, 5 * 60 * 1000);

        return () => clearInterval(intervalId);

        if (!banner.length) return null;
    }, []);


    return (
        <>
            <BudgetBannerNotification
                message={banner[bannerIdx]}
                onClose={() => {
                    sessionStorage.setItem('bannerDismissed', 'true');
                    setBanner([]);
                    setBannerIdx(0);
                }}
                onNext={() => setBannerIdx(idx => (idx + 1) % banner.length)}
                onPrev={() => setBannerIdx(idx => (idx - 1 + banner.length) % banner.length)}
                showPrev={banner.length > 1}
                showNext={banner.length > 1}
                idx={bannerIdx}
                total={banner.length}
            />
        </>
    );
}