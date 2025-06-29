import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BudgetForecast from '../component/BudgetForecast';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');
const pieMock = vi.fn(() => <div data-testid="pie-chart" />);
vi.mock('react-chartjs-2', () => ({
  Pie: (props) => pieMock(props)
}));
vi.mock('../component/ForecastConvertedExpenses', () => ({
  default: () => <div data-testid="forecast-converted-expenses" />
}));



describe('BudgetForecast', () => {
  beforeEach(() => {
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
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('shows loading initially', () => {
    render(<BudgetForecast />);
    expect(screen.getByText(/Loading forecast/i)).toBeInTheDocument();
  });

  it('shows error if user not logged in', () => {
    localStorage.removeItem('token');
    render(<BudgetForecast />);
    expect(screen.getByText(/User not logged in/i)).toBeInTheDocument();
  });

  it('shows error if API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<BudgetForecast />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch budgets/i)).toBeInTheDocument();
    });
  });

  it('renders pie chart and forecast info on success', async () => {
    axios.get.mockResolvedValueOnce({
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
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('forecast-converted-expenses')).toBeInTheDocument();
    });
  });

  it('passes correct data to Pie chart', async () => {
    render(<BudgetForecast />);
    await waitFor(() => {
      // Pie should have been called
      expect(pieMock).toHaveBeenCalled();
      const props = pieMock.mock.calls[0][0]; // The first call's first argument

      // Check labels
      expect(props.data.labels).toEqual(['Food', 'Transport']);
      // Check values
      expect(props.data.datasets[0].data).toEqual([50, 30]);
      // Check colors
      expect(props.data.datasets[0].backgroundColor).toEqual([
        '#1976d2', // Food
        '#388e3c'  // Transport
      ]);
      expect(props.data.datasets[0].borderWidth).toBe(1);
    });
  });

  it('calls axios.get with correct URL and headers', async () => {
    render(<BudgetForecast />);
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
});
