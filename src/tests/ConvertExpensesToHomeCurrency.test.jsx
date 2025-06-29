import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConvertExpensesToHomeCurrency from '../component/ConvertExpensesToHomeCurrency';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('ConvertExpensesToHomeCurrency', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('calls backend and currency API, then displays converted results', async () => {
    // Mock backend /expense/get
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', category: 'Food', currency: 'USD', amount: 10, notes: 'Lunch' },
        { _id: '2', category: 'Transport', currency: 'SGD', amount: 5, notes: 'Bus' }
      ]
    });

    // Mock fetch for currency conversion
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        rates: { SGD: 1.5 }
      })
    });

    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      // Check backend call
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/expense/get',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      // Check currency API call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.exchangerate-api.com/v4/latest/USD')
      );
      // Check UI
      expect(screen.getByText(/Food/)).toBeInTheDocument();
      expect(screen.getByText(/Lunch/)).toBeInTheDocument();
      expect(screen.getByText('SGD 15.00')).toBeInTheDocument(); // 10 * 1.5
      expect(screen.getAllByText('SGD 5.00').length).toBeGreaterThan(0); // SGD expense, no conversion
    });
  });

  it('shows error if backend fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));
    await waitFor(() => {
      expect(screen.getByText(/Conversion failed/i)).toBeInTheDocument();
    });
  });

  it('fetches expenses and calls exchange rate API, then displays converted results', async () => {
    // Mock expenses from backend
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', category: 'Food', currency: 'USD', amount: 10, notes: 'Lunch' },
        { _id: '2', category: 'Transport', currency: 'SGD', amount: 5, notes: 'Bus' }
      ]
    });

    // Mock fetch for exchange rate API
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: async () => ({
        rates: { SGD: 1.5 }
      })
    });

    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));

    await waitFor(() => {
      // axios.get called with correct URL and headers
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/expense/get',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      // fetch called with correct exchange rate API URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.exchangerate-api.com/v4/latest/USD')
      );
      // Check that converted results are rendered
      expect(screen.getByText(/Food/)).toBeInTheDocument();
      expect(screen.getByText(/Lunch/)).toBeInTheDocument();
      expect(screen.getByText(/SGD 15.00/)).toBeInTheDocument(); // 10 * 1.5
      expect(screen.getAllByText('SGD 5.00').length).toBeGreaterThan(0); // SGD expense, no conversion
    });
  });

  it('shows error if conversion fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<ConvertExpensesToHomeCurrency homeCurrency="SGD" />);
    fireEvent.click(screen.getByRole('button', { name: /convert/i }));
    await waitFor(() => {
      expect(screen.getByText(/Conversion failed/i)).toBeInTheDocument();
    });
  });
});