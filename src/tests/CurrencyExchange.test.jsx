import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CurrencyExchange from '../component/CurrencyExchange';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('CurrencyExchange - robust user testing', () => {
  const mockRates = { SGD: 1, USD: 0.74, EUR: 0.68 };

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { rates: mockRates } });
    localStorage.clear();
  });

  it('fetches and displays currency options', async () => {
    render(<CurrencyExchange />);
    await waitFor(() => {
      expect(screen.getAllByRole('option', { name: 'SGD' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('option', { name: 'USD' }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('option', { name: 'EUR' }).length).toBeGreaterThan(0);
    });
  });

  it('allows user to select source and target currencies', async () => {
    render(<CurrencyExchange />);
    await waitFor(() => screen.getByLabelText(/from/i));
    fireEvent.change(screen.getByLabelText(/from/i), { target: { value: 'USD' } });
    fireEvent.change(screen.getByLabelText(/to/i), { target: { value: 'EUR' } });
    expect(screen.getByLabelText(/from/i).value).toBe('USD');
    expect(screen.getByLabelText(/to/i).value).toBe('EUR');
  });

  it('allows user to enter amount and shows conversion', async () => {
    render(<CurrencyExchange />);
    await waitFor(() => screen.getByLabelText(/amount/i));
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/from/i), { target: { value: 'SGD' } });
    fireEvent.change(screen.getByLabelText(/to/i), { target: { value: 'USD' } });
    // Simulate convert button if present
    if (screen.queryByRole('button', { name: /convert/i })) {
      fireEvent.click(screen.getByRole('button', { name: /convert/i }));
    }
    await waitFor(() => {
      // Adjust this matcher to your actual result display
      expect(screen.getByText(/converted amount/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid amount', async () => {
    render(<CurrencyExchange />);
    await waitFor(() => screen.getByLabelText(/amount/i));
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '-10' } });
    if (screen.queryByRole('button', { name: /convert/i })) {
      fireEvent.click(screen.getByRole('button', { name: /convert/i }));
    }
    expect(await screen.findByText(/invalid amount/i)).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API error'));
    render(<CurrencyExchange />);
    await waitFor(() => {
      expect(screen.getByText(/unable to fetch rates/i)).toBeInTheDocument();
    });
  });

  it('swaps currencies when swap button is clicked', async () => {
    render(<CurrencyExchange />);
    await waitFor(() => screen.getByLabelText(/from/i));
    fireEvent.change(screen.getByLabelText(/from/i), { target: { value: 'SGD' } });
    fireEvent.change(screen.getByLabelText(/to/i), { target: { value: 'USD' } });
    if (screen.queryByRole('button', { name: /swap/i })) {
      fireEvent.click(screen.getByRole('button', { name: /swap/i }));
      expect(screen.getByLabelText(/from/i).value).toBe('USD');
      expect(screen.getByLabelText(/to/i).value).toBe('SGD');
    }
  });

  it('is accessible by label and role', async () => {
    render(<CurrencyExchange />);
    await waitFor(() => {
      expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});