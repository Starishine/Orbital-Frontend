import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ForecastConvertedExpenses from '../component/ForecastConvertedExpenses';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('ForecastConvertedExpenses', () => {
  const converted = [
    { category: 'Food', convertedAmount: 50, date: '2024-06-01' },
    { category: 'Food', convertedAmount: 30, date: '2024-06-02' },
    { category: 'Transport', convertedAmount: 20, date: '2024-06-01' }
  ];

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('homeCurrency', 'SGD');
    vi.clearAllMocks();
    // Mock axios.post for ML/insights API
    axios.post = vi.fn(() => Promise.resolve({ data: [] }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('makes a budget API request with the correct token and URL', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 },
        { category: 'Transport', currency: 'SGD', amountAllocated: 50, amount: 30 }
      ]
    });
    render(<ForecastConvertedExpenses converted={converted} />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:8080/budget/get',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
    });
  });

  it('shows forecast data for each category like Food and Transport', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 },
        { category: 'Transport', currency: 'SGD', amountAllocated: 50, amount: 30 }
      ]
    });
    render(<ForecastConvertedExpenses converted={converted} />);
    expect(await screen.findByText(/Forecast by Category/i)).toBeInTheDocument();
    expect(await screen.findByText((_, el) => el.textContent.includes('Food'))).toBeInTheDocument();
    expect(await screen.findByText((_, el) => el.textContent.includes('Transport'))).toBeInTheDocument();
    expect(screen.getAllByText(/SGD/).length).toBeGreaterThan(1);
  });

  it('displays error if backend fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<ForecastConvertedExpenses converted={converted} />);
    expect(await screen.findByText(/Failed to fetch budgets/i)).toBeInTheDocument();
  });

  it('shows login error when no token is found', async () => {
    localStorage.removeItem('token');
    render(<ForecastConvertedExpenses converted={converted} />);
    expect(await screen.findByText(/User not logged in/i)).toBeInTheDocument();
  });

  it('tells user there are no converted expenses to forecast', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 }
      ]
    });
    render(<ForecastConvertedExpenses converted={[]} />);
    expect(await screen.findByText(/No converted expenses to forecast/i)).toBeInTheDocument();
  });

  it('correctly calculates daily forecast, remaining budget, and run-out date', async () => {
  axios.get.mockResolvedValueOnce({
    data: [
      { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 }
    ]
  });
  render(<ForecastConvertedExpenses converted={converted.filter(e => e.category === 'Food')} />);
  // Wait for the forecast card to appear
  const foodEls = await screen.findAllByText((_, el) => el.textContent.includes('Food'));
  expect(foodEls.length).toBeGreaterThan(0);
  expect(foodEls[0]).toBeInTheDocument();
  // Average per interval (daily): 40.00
  expect(screen.getByText((_, el) => el.textContent.includes('40.00'))).toBeInTheDocument();
  // Remaining
  expect(screen.getByText(/Remaining:/)).toBeInTheDocument();
  expect(screen.getByText(/SGD 20.00/)).toBeInTheDocument();
  // Forecast message
  expect(screen.getByText((_, el) =>
    el.textContent.includes('if you keep spending at') &&
    el.textContent.includes('you’ll run out of budget in')
  )).toBeInTheDocument();
  // 0.5 days left
  expect(screen.getByText((_, el) =>
    el.textContent.match(/0\.5\b/) && el.textContent.includes('day')
  )).toBeInTheDocument();
  });
});