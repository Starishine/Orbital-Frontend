import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BudgetForecast from '../component/BudgetForecast';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

const pieMock = vi.fn(() => <div data-testid="pie-chart" />); // mocking the pie chart so it doesn't crash or try to render actual chart
vi.mock('react-chartjs-2', () => ({
  Pie: (props) => pieMock(props)
}));

vi.mock('../component/ForecastConvertedExpenses', () => ({
  default: () => <div data-testid="forecast-converted-expenses" />
}));

describe('BudgetForecast', () => {
  beforeEach(() => {
    // set up fake data in localStorage for each test
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('homeCurrency', 'SGD');
    localStorage.setItem('convertedExpenses', JSON.stringify([
      { category: 'Food', convertedAmount: 50 },
      { category: 'Transport', convertedAmount: 30 }
    ]));

    axios.get = vi.fn(() =>
      Promise.resolve({
        data: []
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks(); // clear everything after each test so they don't mess with each other
    localStorage.clear();
  });

  it('shows loading initially', () => {
    render(<BudgetForecast />);
    expect(screen.getByText(/Loading forecast/i)).toBeInTheDocument();
  });

  it('shows error if user is not logged in', () => {
    localStorage.removeItem('token');
    render(<BudgetForecast />);
    expect(screen.getByText(/User not logged in/i)).toBeInTheDocument();
  });

  it('shows error when API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<BudgetForecast />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch budgets/i)).toBeInTheDocument();
    });
  });

  it('shows pie chart and forecast info on success', async () => {
    axios.get.mockResolvedValueOnce({ // fake API gives 1 budget category back
      data: [
        {
          category: 'Food',
          currency: 'SGD',
          amountAllocated: 100,
          amount: 50,
          createdAt: new Date().toISOString()
        }
      ]
    });

    render(<BudgetForecast />);
    await waitFor(() => {
      expect(screen.getByText(/Expense Distribution by Category/i)).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument(); // pie chart shows
      expect(screen.getByTestId('forecast-converted-expenses')).toBeInTheDocument(); // forecast section shows
    });
  });

  it('correct data is passed to Pie chart', async () => {
    render(<BudgetForecast />);
    await waitFor(() => {
      expect(pieMock).toHaveBeenCalled();
      const props = pieMock.mock.calls[0][0];

      expect(props.data.labels).toEqual(['Food', 'Transport']);
      expect(props.data.datasets[0].data).toEqual([50, 30]);
      expect(props.data.datasets[0].backgroundColor).toEqual([
        '#1976d2', // food color
        '#388e3c'  // transport color
      ]);
      expect(props.data.datasets[0].borderWidth).toBe(1);
    });
  });

  it('calls axios.get with correct URL and headers', async () => {
    render(<BudgetForecast />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/budget/get',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
    });
  });
});
