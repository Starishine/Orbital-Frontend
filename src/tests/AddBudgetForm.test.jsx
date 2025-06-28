import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddBudgetForm from '../component/AddBudgetForm';
import '@testing-library/jest-dom';
import axios from 'axios';
import { expect } from 'vitest';

vi.mock('axios');
vi.mock('../component/CurrencyDropdown', () => ({
  default: ({ value, onChange }) => (
    <select data-testid="currency-dropdown" value={value} onChange={onChange}>
      <option value="SGD">SGD</option>
      <option value="USD">USD</option>
    </select>
  )
}));

describe('AddBudgetForm', () => {
  beforeEach(() => {
    localStorage.setItem('currency', 'SGD');
    axios.post = vi.fn(() => Promise.resolve({ data: {} }));
  });

  it('renders category, amount, and currency fields', () => {
    render(<AddBudgetForm />);
    expect(screen.getByLabelText(/Category/i)).toBeVisible();
    expect(screen.getByLabelText(/Budget Amount/i)).toBeVisible();
    expect(screen.getByTestId('currency-dropdown')).toBeVisible();
    expect(screen.getByRole('button', { name: /Add Budget/i })).toBeVisible();
  });

  it('shows custom category input when Others is selected', () => {
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Others' } });
    expect(screen.getByLabelText(/Enter Category/i)).toBeVisible();
  });

  it('category and amount fields are required', () => {
    render(<AddBudgetForm />);
    const categoryField = screen.getByLabelText(/Category/i);
    const amountField = screen.getByLabelText(/Budget Amount/i);

    expect(categoryField).toBeRequired();
    expect(amountField).toBeRequired();
  });

  it('submits correct data to axios.post', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: 'SUCCESS' } });
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '200' } });
    fireEvent.change(screen.getByTestId('currency-dropdown'), { target: { value: 'SGD' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          category: 'Food',
          currency: 'SGD',
          amountAllocated: 200,
          amount: 200,
        }),
        expect.any(Object)
      );
    });
  });

  it('shows alert with API error message on failure to post', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          code: 400,
          status: 'ERROR',
          data: null,
          message: 'API error'
        }
      }
    });
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('An error occurred while adding the budget. Please try again.');
    });
    alertMock.mockRestore();
  });

  it('shows alert if budget for category already exists for the user', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
    axios.post.mockResolvedValueOnce({
      data: {
        code: 400,
        status: 'ERROR',
        data: null,
        message: 'Budget for this category already exists for the user'
      }
    });
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Budget for this category already exists for the user');
    });
    alertMock.mockRestore();
  });

});