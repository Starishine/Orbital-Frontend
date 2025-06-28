import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CurrencyDropdown from '../component/CurrencyDropdown';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('CurrencyDropdown', () => {
  const mockRates = { SGD: 1, USD: 0.74, EUR: 0.68 };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { rates: mockRates } });
    localStorage.clear();
  });

  it('fetches and displays currency options', async () => {
    render(<CurrencyDropdown currency="SGD" setCurrency={vi.fn()} />);
    // Wait for options to appear
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'SGD' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'USD' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'EUR' })).toBeInTheDocument();
    });
  });

  it('shows the selected currency', async () => {
    render(<CurrencyDropdown currency="USD" setCurrency={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByRole(/from/i).value).toBe('USD');
    });
  });

  it('calls setCurrency and updates localStorage on change', async () => {
    const setCurrency = vi.fn();
    render(<CurrencyDropdown currency="SGD" setCurrency={setCurrency} />);
    await waitFor(() => screen.getByRole('/from/i'));
    fireEvent.change(screen.getByRole('/to/i'), { target: { value: 'EUR' } });
    expect(setCurrency).toHaveBeenCalledWith('EUR');
    expect(localStorage.getItem('currency')).toBe('EUR');
  });

  it('renders label for accessibility', async () => {
    render(<CurrencyDropdown currency="SGD" setCurrency={vi.fn()} />);
    expect(screen.getByLabelText(/select currency/i)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<CurrencyDropdown currency="SGD" setCurrency={vi.fn()} />);
    // Should not throw, just renders empty select
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('renders no options if rates are empty', async () => {
    axios.get.mockResolvedValueOnce({ data: { rates: {} } });
    render(<CurrencyDropdown currency="SGD" setCurrency={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByRole('combobox').children.length).toBe(0);
    });
  });
});