import React from 'react';
import { render, screen } from '@testing-library/react';
import Exchange from '../pages/Exchange';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom'; // without importing this it will give invalid Chai property error

// Mock CurrencyExchange component
vi.mock('../component/CurrencyExchange', () => ({
    default: () => <div>CurrencyExchangeMock</div>
}));

describe('Exchange Page', () => {
    it('renders navigation links', () => {
        render(
            <MemoryRouter>
                <Exchange />
            </MemoryRouter>
        );
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Exchange')).toBeInTheDocument();
        expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
        expect(screen.getByText('Exchange').closest('a')).toHaveAttribute('href', '/exchange');
    });

    it('renders the CurrencyExchange component', () => {
        render(
            <MemoryRouter>
                <Exchange />
            </MemoryRouter>
        );
        expect(screen.getByText('CurrencyExchangeMock')).toBeInTheDocument();
    });
});