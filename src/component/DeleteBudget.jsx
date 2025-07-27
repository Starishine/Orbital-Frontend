import axios from 'axios';
import ExistingExpenses from './ExistingExpense';
import React from "react";

// DeleteBudget: Button component to delete a budget by its ID
export default function DeleteBudget({ budgetId, onDeleteSuccess }) {
    // Handler for deleting the budget
    const handleDelete = () => {
        // Confirm with the user before deleting
        if (!window.confirm('Are you sure you want to delete this budget?')) {
            return; // User cancelled the deletion
        }

        // Send deletee request to backend API
        axios.delete(`/api/budget/delete/${budgetId}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                const data = response.data;
                console.log(data);
                // If deletion is successful, call the success callback
                if (data.status === "SUCCESS" && data.code === 200) {
                    onDeleteSuccess();
                } else {
                    console.error('Error deleting budget:', data.message);
                }
            })
            .catch((error) => {
                console.error('Error deleting budget:', error);
            });
    };

    return (
        // Delete button
        <button onClick={handleDelete} style={{ color: 'red' }}>
            Delete Budget
        </button>
    );
}