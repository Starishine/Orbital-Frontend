import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddExpenseForm from '../component/AddExpenseForm';
import '@testing-library/jest-dom';
import axios from 'axios';
import { expect } from 'vitest';

vi.mock('axios');
vi.mock('../component/CurrencyDropdown', () => ({
    default: ({ currency, setCurrency }) => (
        <select
            data-testid="currency-dropdown"
            value={currency}
            onChange={e => setCurrency(e.target.value)}
        >
            <option value="SGD">SGD</option>
            <option value="USD">USD</option>
        </select>
    )
}));
vi.mock('../component/CategoryFeedback', () => ({
    default: () => <div data-testid="category-feedback">Feedback</div>
}));

const originalReload = window.location.reload;
beforeEach(() => {
    window.location.reload = vi.fn();
});
afterEach(() => {
    window.location.reload = originalReload;
});

describe('AddExpenseForm', () => {
    beforeEach(() => {
        localStorage.setItem('currency', 'SGD');
        localStorage.setItem('token', 'test-token');
        axios.get = vi.fn(() =>
            Promise.resolve({ data: [{ category: 'Food' }, { category: 'Transport' }] })
        );
        axios.post = vi.fn(() => Promise.resolve({ data: {} }));
    });

    it('renders description, category, amount, currency and date fields', async () => {
        render(<AddExpenseForm />);
        expect(await screen.findByLabelText(/Name/i)).toBeVisible();
        expect(screen.getByLabelText(/Category/i)).toBeVisible();
        expect(screen.getByTestId('currency-dropdown')).toBeVisible();
        expect(screen.getByLabelText(/Amount/i)).toBeVisible();
        expect(screen.getByLabelText(/Date/i)).toBeVisible();
        expect(screen.getByRole('button', { name: /Add/i })).toBeVisible();
    });

    it('category and amount fields are required', async () => {
        render(<AddExpenseForm />);
        expect(screen.getByLabelText(/Category/i)).toBeRequired();
        expect(screen.getByLabelText(/Amount/i)).toBeRequired();
    });

    it('submits correct data to axios.post', async () => {
        axios.post.mockResolvedValueOnce({ data: { status: 'SUCCESS', code: 200 } });
        // ...rest of your test
        fireEvent.click(screen.getByRole('button', { name: /Add/i }));
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/expense/create'),
                expect.objectContaining({ /* ... */ }),
                expect.any(Object)
            );
            expect(window.location.reload).toHaveBeenCalled();
        });
    });

    it('shows alert with API error message on failure to post', async () => {
        const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
        axios.post.mockRejectedValueOnce({});
        render(<AddExpenseForm />);
        fireEvent.change(await screen.findByLabelText(/Name/i), { target: { value: 'Dinner' } });
        fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '20' } });

        fireEvent.click(screen.getByRole('button', { name: /Add/i }));

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                'An error occurred while adding the expense. Please try again.'
            );
        });
        alertMock.mockRestore();
    });

});