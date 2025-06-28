import React from 'react';
import CreateSharedBudgetForm from '../component/CreateSharedBudgetForm';
import SharedBudgetDetail from '../component/SharedBudgetDetail';

export default function SharedBudget() {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Shared Budget</h1>
            <p>You can create your shared budget right here!</p>
            <CreateSharedBudgetForm />
            <SharedBudgetDetail />
        </div>
    );
}