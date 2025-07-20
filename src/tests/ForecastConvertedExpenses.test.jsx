import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ForecastConvertedExpenses from '../component/ForecastConvertedExpenses';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('ForecastConvertedExpenses', () => {
  const converted = [
    {
      category: 'Food',
      convertedAmount: 50,
      date: '2024-06-01'
    },
    {
      category: 'Food',
      convertedAmount: 30,
      date: '2024-06-02'
    },
    {
      category: 'Transport',
      convertedAmount: 20,
      date: '2024-06-01'
    }
  ];

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('homeCurrency', 'SGD');
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // it('makes a budget API request with the correct token and URL', async () => {
  //   axios.get.mockResolvedValueOnce({
  //     data: [
  //       { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 },
  //       { category: 'Transport', currency: 'SGD', amountAllocated: 50, amount: 30 }
  //     ]
  //   });
  //   render(<ForecastConvertedExpenses converted={converted} />);
  //   await waitFor(() => {
  //     expect(axios.get).toHaveBeenCalledWith(
  //       'http://localhost:8080/budget/get',
  //       expect.objectContaining({
  //         headers: expect.objectContaining({
  //           Authorization: 'Bearer test-token'
  //         })
  //       })
  //     );
  //   });
  // });

  it('shows forecast data for each category like Food and Transport', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 },
        { category: 'Transport', currency: 'SGD', amountAllocated: 50, amount: 30 }
      ]
    });
    render(<ForecastConvertedExpenses converted={converted} />);
    await waitFor(() => {
      expect(screen.getByText(/Forecast by Category/i)).toBeInTheDocument();
      expect(screen.getByText(/Food/)).toBeInTheDocument();
      expect(screen.getByText(/Transport/)).toBeInTheDocument();
      expect(screen.getAllByText(/SGD/).length).toBeGreaterThan(1);
    });
  });

  it('displays error if backend fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<ForecastConvertedExpenses converted={converted} />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch budgets/i)).toBeInTheDocument();
    });
  });

  it('shows login error when no token is found', async () => {
    localStorage.removeItem('token');
    render(<ForecastConvertedExpenses converted={converted} />);
    await waitFor(() => {
      expect(screen.getByText(/User not logged in/i)).toBeInTheDocument();
    });
  });

  it('tells user there are no converted expenses to forecast', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 }
      ]
    });
    render(<ForecastConvertedExpenses converted={[]} />);
    await waitFor(() => {
      expect(screen.getByText(/No converted expenses to forecast/i)).toBeInTheDocument();
    });
  });

  // Food: spent = 80 (50+30), allocated = 100, remaining = 20, 2 days of expenses (interval = daily)
  // avgPerInterval = 40, intervalsLeft = 20/40 = 0.5, so should show 0.5 days left, and a run out date
  it('correctly calculates daily forecast, remaining budget, and run-out date', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { category: 'Food', currency: 'SGD', amountAllocated: 100, amount: 20 }
      ]
    });
    render(<ForecastConvertedExpenses converted={converted.filter(e => e.category === 'Food')} />);
    await waitFor(() => {
      expect(screen.getByText(/40\.00/)).toBeInTheDocument();
      expect(
        screen.getAllByText((content, node) =>
          node.textContent.includes('you’ll run out of budget in') &&
          node.textContent.match(/0\.5\b/) &&
          node.textContent.includes('day')
        ).length
      ).toBeGreaterThan(0);
      expect(screen.getByText(/Remaining:/)).toBeInTheDocument();
      expect(screen.getByText(/SGD 20\.00/)).toBeInTheDocument();
      expect(screen.getByText(/if you keep spending at/)).toBeInTheDocument();
      expect(screen.getByText(/you’ll run out of budget in/)).toBeInTheDocument();
    });
  });
});