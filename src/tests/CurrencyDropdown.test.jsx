import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CurrencyDropdown from '../component/CurrencyDropdown';
import '@testing-library/jest-dom';

describe('CurrencyDropdown - robust user testing', () => {
  const currencies = [
    { code: 'SGD', name: 'Singapore Dollar' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
  ];
  const onChange = vi.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('renders all currency options', () => {
    render(<CurrencyDropdown currencies={currencies} value="SGD" onChange={onChange} />);
    currencies.forEach(currency => {
      expect(screen.getByText(currency.name)).toBeInTheDocument();
    });
  });

  it('shows the selected value', () => {
    render(<CurrencyDropdown currencies={currencies} value="USD" onChange={onChange} />);
    expect(screen.getByRole('combobox').value).toBe('USD');
  });

  it('calls onChange when a new currency is selected', () => {
    render(<CurrencyDropdown currencies={currencies} value="SGD" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'EUR' } });
    expect(onChange).toHaveBeenCalledWith('EUR');
  });

  it('does not call onChange if the same value is selected', () => {
    render(<CurrencyDropdown currencies={currencies} value="SGD" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'SGD' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders with empty currencies array', () => {
    render(<CurrencyDropdown currencies={[]} value="" onChange={onChange} />);
    expect(screen.getByRole('combobox').children.length).toBe(0);
  });

  it('renders with missing value prop', () => {
    render(<CurrencyDropdown currencies={currencies} onChange={onChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with missing onChange prop', () => {
    render(<CurrencyDropdown currencies={currencies} value="SGD" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('is accessible by label', () => {
    render(<CurrencyDropdown currencies={currencies} value="SGD" onChange={onChange} label="Currency" />);
    expect(screen.getByLabelText(/currency/i)).toBeInTheDocument();
  });

  it('is accessible by role', () => {
    render(<CurrencyDropdown currencies={currencies} value="SGD" onChange={onChange} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles null/undefined currencies gracefully', () => {
    render(<CurrencyDropdown currencies={null} value="" onChange={onChange} />);
    expect(screen.getByRole('combobox').children.length).toBe(0);

    render(<CurrencyDropdown currencies={undefined} value="" onChange={onChange} />);
    expect(screen.getByRole('combobox').children.length).toBe(0);
  });

  it('renders without crashing if no props are passed', () => {
    render(<CurrencyDropdown />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('does not break if currency code is missing in option', () => {
    const badCurrencies = [{ name: 'No Code' }];
    render(<CurrencyDropdown currencies={badCurrencies} value="" onChange={onChange} />);
    expect(screen.getByRole('combobox').children.length).toBe(1);
  });

  it('supports keyboard navigation', () => {
    render(<CurrencyDropdown currencies={currencies} value="SGD" onChange={onChange} />);
    const combo = screen.getByRole('combobox');
    combo.focus();
    fireEvent.keyDown(combo, { key: 'ArrowDown' });
    fireEvent.change(combo, { target: { value: 'USD' } });
    expect(onChange).toHaveBeenCalledWith('USD');
  });
});