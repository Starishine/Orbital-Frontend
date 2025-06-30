import React from 'react';
import { render, screen } from '@testing-library/react';
import Exchange from '../pages/Exchange';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom'; // without importing this it will give invalid Chai property error which means u are using a custom mathcee without iporting the library that provides it

// mock CurrencyExchange component
vi.mock('../component/CurrencyExchange', () => ({
    default: () => <div>CurrencyExchangeMock</div>
}));

describe('Exchange Page', () => {
    it('renders navigation links', () => {
        render(
            <MemoryRouter>
                <Exchange /> // simulating Exchnage component inside MemoryRouter whihc is a special router used for testing. simulates routing in memory without any real url changes
            </MemoryRouter>
        );
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Exchange')).toBeInTheDocument();
        expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard'); // finds the element on the page that displays the text 'Dashboard' and finds the nearest ancestor tagt <a> which is the anchor tag that wraps the text 'Dashboard' and checks if it has the href attribute with value '/dashboard'
        expect(screen.getByText('Exchange').closest('a')).toHaveAttribute('href', '/exchange');
    });

    it('shows the CurrencyExchange component', () => {
        render(
            <MemoryRouter>
                <Exchange />
            </MemoryRouter>
        );
        expect(screen.getByText('CurrencyExchangeMock')).toBeInTheDocument();
    });
});