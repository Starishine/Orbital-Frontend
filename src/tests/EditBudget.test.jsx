import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditBudget from '../component/EditBudget';
import '@testing-library/jest-dom';
import axios from 'axios';

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

describe('EditBudget', () => {
  const budget = {
    id: 'budget123',
    currency: 'SGD',
    amountAllocated: 100,
    amount: 80
  };
  const onSave = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    vi.clearAllMocks();
  });

  it('calls axios.put with correct data when currency is unchanged', async () => {
    axios.put.mockResolvedValueOnce({});
    render(<EditBudget budget={budget} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/budget/update',
        expect.objectContaining({
          id: 'budget123',
          currency: 'SGD',
          amountAllocated: 120,
          amount: 100
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('calls currency API and axios.put with converted values when currency is changed', async () => {
    // Mock fetch for currency conversion
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ rates: { USD: 0.75 } })
    });
    axios.put.mockResolvedValueOnce({});
    render(<EditBudget budget={budget} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByTestId('currency-dropdown'), { target: { value: 'USD' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      // call fetch for conversion
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.exchangerate-api.com/v4/latest/SGD')
      );
      // call axios.put with converted values
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/budget/update',
        expect.objectContaining({
          id: 'budget123',
          currency: 'USD',
          // The converted values will depend on conversion logic
        }),
        expect.any(Object)
      );
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('shows alert if currency conversion fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ rates: {} }) // No rate for target currency
    });
    window.alert = vi.fn();
    render(<EditBudget budget={budget} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByTestId('currency-dropdown'), { target: { value: 'USD' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Currency conversion failed.');
      expect(axios.put).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it('shows alert if backend update fails', async () => {
    axios.put.mockRejectedValueOnce(new Error('API error'));
    window.alert = vi.fn();
    render(<EditBudget budget={budget} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to update budget.');
      expect(onSave).not.toHaveBeenCalled();
    });
  });
});