import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditBudget from '../component/EditBudget';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');
vi.mock('../component/CurrencyDropdown', () => ({
  default: ({ currency, setCurrency }) => (
    <select
      data-testid="currencydropdown"
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
    id: 'moushamisbudget',
    currency: 'SGD',
    amountAllocated: 100, // og total budget for category
    amount: 80 //remianing money in category budget
  };
  const onSave = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    localStorage.setItem('token', 'testing_token');
    vi.clearAllMocks();
  });

  it('saves the updated budget correctly when currency stays the same', async () => {
    axios.put.mockResolvedValueOnce({}); // fakes the successful update output
    render(<EditBudget budget={budget} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/budget/update',
        expect.objectContaining({
          id: 'moushamisbudget',
          currency: 'SGD',
          amountAllocated: 120, // updated = 100 + 20
          amount: 100 
        }),
        expect.objectContaining({ 
          headers: expect.objectContaining({
            Authorization: 'Bearer testing_token'
          })
        })
      );
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('converts currency and saves the updated budget when currency is changed', async () => {
    // mock fetch for currency conversion - allows you to request data from a server or API endpoint.
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ rates: { USD: 0.75 } }) // creating a fake function called json whihc will return a promise that resolves to {rates: {USD: 0.75}}
    });
    axios.put.mockResolvedValueOnce({});
    render(<EditBudget budget={budget} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByTestId('currencydropdown'), { target: { value: 'USD' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      // call fetch for conversion - gets the exchange rate for SGD to USD
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.exchangerate-api.com/v4/latest/SGD')
      );
      // call axios.put with converted values
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8080/budget/update',
        expect.objectContaining({
          id: 'moushamisbudget',
          currency: 'USD',
          // The converted values will depend on conversion logic
        }),
        expect.any(Object)
      );
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('alerts the user if currency conversion does not work', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ rates: {} }) // no rate for target currency
    });
    window.alert = vi.fn();
    render(<EditBudget budget={budget} onSave={onSave} onCancel={onCancel} />);
    fireEvent.change(screen.getByTestId('currencydropdown'), { target: { value: 'USD' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Currency conversion failed.');
      expect(axios.put).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
    });
  });

  it('alerts the user if saving the updated budget fails', async () => {
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