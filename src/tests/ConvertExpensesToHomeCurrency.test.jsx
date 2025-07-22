import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConvertExpensesToHomeCurrency from '../component/ConvertExpensesToHomeCurrency';
import '@testing-library/jest-dom';
import axios from 'axios';

// mock axios so we don’t actually call real backend
vi.mock('axios');

describe('ConvertExpensesToHomeCurrency', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    vi.resetAllMocks(); // clear all previous mocks
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('fetches expenses and conversion rate, then shows converted values', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', category: 'Food', currency: 'USD', amount: 10, notes: 'Lunch' },
        { _id: '2', category: 'Transport', currency: 'SGD', amount: 5, notes: 'Bus' }
      ] // fake backend response for expenses
    });

    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        rates: { SGD: 1.5 } // fake currency conversion: 1 USD = 1.5 SGD
      })
    });

    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      // check if called the backend correctly
      expect(axios.get).toHaveBeenCalledWith(
        '/api/expense/get',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );

      // check if called the exchange rate api with the right base currency
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.exchangerate-api.com/v4/latest/USD')
      );

      // now check that converted stuff shows up
      expect(screen.getByText(/Food/)).toBeInTheDocument();
      expect(screen.getByText(/Lunch/)).toBeInTheDocument();
      expect(screen.getByText('SGD 15.00')).toBeInTheDocument(); // 10 usd * 1.5 = 15 sgd
      expect(screen.getAllByText('SGD 5.00').length).toBeGreaterThan(0); // no conversion needed
    });
  });

  it('shows error message when backend fails', async () => {
    // backend throws error
    axios.get.mockRejectedValueOnce(new Error('API error'));

    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));

    // should show some kind of error message on screen
    await waitFor(() => {
      expect(screen.getByText(/Conversion failed/i)).toBeInTheDocument();
    });
  });

  it('handles expense + conversion flow correctly and gives the final results', async () => {
    // fake response again
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', category: 'Food', currency: 'USD', amount: 10, notes: 'Lunching yum yum' },
        { _id: '2', category: 'Transport', currency: 'SGD', amount: 5, notes: 'mrt ride' }
      ]
    });

    // fake currency rates again
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        rates: { SGD: 1.5 }
      })
    });

    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      // same checks as earlier
      expect(axios.get).toHaveBeenCalledWith(
        '/api/expense/get',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.exchangerate-api.com/v4/latest/USD')
      );

      expect(screen.getByText(/Food/)).toBeInTheDocument();
      expect(screen.getByText(/Lunching yum yum/)).toBeInTheDocument();
      expect(screen.getByText(/SGD 15.00/)).toBeInTheDocument();
      expect(screen.getAllByText('SGD 5.00').length).toBeGreaterThan(0);
    });
  });

  it('shows error message when conversion fails', async () => {
    // fail the backend call again
    axios.get.mockRejectedValueOnce(new Error('API error'));

    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      expect(screen.getByText(/Conversion failed/i)).toBeInTheDocument();
    });
  });
});
