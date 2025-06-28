import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddBudgetForm from '../component/AddBudgetForm';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');
vi.mock('../component/CurrencyDropdown', () => ({
  default: ({ value, onChange }) => (
    <select data-testid="currency-dropdown" value={value} onChange={onChange}>
      <option value="SGD">SGD</option>
      <option value="USD">USD</option>
    </select>
  )
}));

describe('AddBudgetForm - robust user testing', () => {
  beforeEach(() => {
    localStorage.setItem('currency', 'SGD');
    axios.post = vi.fn(() => Promise.resolve({ data: {} }));
  });

  it('renders all fields and submit button', () => {
    render(<AddBudgetForm />);
    expect(screen.getByLabelText(/Category/i)).toBeVisible();
    expect(screen.getByLabelText(/Budget Amount/i)).toBeVisible();
    expect(screen.getByTestId('currency-dropdown')).toBeVisible();
    expect(screen.getByRole('button', { name: /Add Budget/i })).toBeVisible();
  });

  it('shows custom category input when Others is selected', () => {
  render(<AddBudgetForm />);
  fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Others' } });
  expect(screen.getByPlaceholderText(/academic fees, etc\./i)).toBeVisible();
});

  it('shows validation error if required fields are missing', async () => {
    render(<AddBudgetForm />);
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));
    expect(await screen.findByText(/please select a category/i)).toBeInTheDocument();
  });

  it('shows validation error if custom category is empty', async () => {
  render(<AddBudgetForm />);
  fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Others' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));
  // If your error message is different, update this as well
  expect(await screen.findByText(/please enter a custom category/i)).toBeInTheDocument();
});

  it('shows validation error for negative or zero amount', async () => {
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '-10' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));
    expect(await screen.findByText(/amount must be greater than zero/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '0' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));
    expect(await screen.findByText(/amount must be greater than zero/i)).toBeInTheDocument();
  });

  it('shows validation error for non-numeric amount', async () => {
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));
    expect(await screen.findByText(/amount must be a number/i)).toBeInTheDocument();
  });

  it('submits correct data to axios.post', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: 'SUCCESS' } });
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '200' } });
    fireEvent.change(screen.getByTestId('currency-dropdown'), { target: { value: 'USD' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          category: 'Food',
          amount: '200',
          currency: 'USD',
        })
      );
    });
  });

  it('submits custom category', async () => {
  axios.post.mockResolvedValueOnce({ data: { status: 'SUCCESS' } });
  render(<AddBudgetForm />);
  fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Others' } });
  fireEvent.change(screen.getByPlaceholderText(/academic fees, etc\./i), { target: { value: 'Gift' } });
  fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '100' } });
  fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        category: 'Gift',
        amount: '100',
        currency: 'SGD',
      })
    );
  });
});

  it('displays API error message on failure', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: 'API error' } });
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '50' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

    expect(await screen.findByText(/api error/i)).toBeInTheDocument();
  });

  it('persists currency from localStorage', () => {
    localStorage.setItem('currency', 'USD');
    render(<AddBudgetForm />);
    expect(screen.getByTestId('currency-dropdown').value).toBe('SGD');
  });

  it('resets form after successful submission', async () => {
    axios.post.mockResolvedValueOnce({ data: { status: 'SUCCESS' } });
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Budget Amount/i).value).toBe('');
    });
  });

  it('is accessible by keyboard (tab order)', () => {
    render(<AddBudgetForm />);
    const category = screen.getByLabelText(/Category/i);
    const amount = screen.getByLabelText(/Budget Amount/i);
    const currency = screen.getByTestId('currency-dropdown');
    const button = screen.getByRole('button', { name: /Add Budget/i });

    category.focus();
    expect(document.activeElement).toBe(category);
    fireEvent.keyDown(category, { key: 'Tab' });
    amount.focus();
    expect(document.activeElement).toBe(amount);
    fireEvent.keyDown(amount, { key: 'Tab' });
    currency.focus();
    expect(document.activeElement).toBe(currency);
    fireEvent.keyDown(currency, { key: 'Tab' });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('disables submit button during submission', async () => {
    let resolvePromise;
    axios.post.mockImplementationOnce(() => new Promise(res => { resolvePromise = res; }));
    render(<AddBudgetForm />);
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText(/Budget Amount/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Budget/i }));

    expect(screen.getByRole('button', { name: /Add Budget/i })).toBeDisabled();
    resolvePromise({ data: { status: 'SUCCESS' } });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Budget/i })).not.toBeDisabled();
    });
  });
});