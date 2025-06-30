import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import * as jwt from 'jwt-decode';
import '@testing-library/jest-dom';


vi.mock('../component/AddBudgetForm', () => ({
    default: () => <div>AddBudgetFormMock</div>
}));
vi.mock('../component/ExistingBudget', () => ({
    default: () => <div>ExistingBudgetMock</div>
}));

// mock jwtDecode
vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn(),
}));

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual, // retain all original exports
        useNavigate: () => mockNavigate,
    };
});

describe('Dashboard', () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        jwt.jwtDecode.mockClear();
    });

    it('goes back to login if there is no token', () => {
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('shows username after extracting from token', async () => {
        localStorage.setItem('token', 'fake-token');
        jwt.jwtDecode.mockReturnValue({ sub: 'cheeky' });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Welcome, cheeky/i)).toBeInTheDocument();
    });

    it('shows AddBudgetForm and ExistingBudget', () => {
        localStorage.setItem('token', 'fake-token');
        jwt.jwtDecode.mockReturnValue({ sub: 'cheeky' });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText('AddBudgetFormMock')).toBeInTheDocument();
        expect(screen.getByText('ExistingBudgetMock')).toBeInTheDocument();
    });

    it('goes to /exchange when Exchange link is clicked', () => {
        localStorage.setItem('token', 'fake-token');
        jwt.jwtDecode.mockReturnValue({ sub: 'moushami' });

        const history = createMemoryHistory({ initialEntries: ['/dashboard'] });

        render(
            <Router location={history.location} navigator={history}>
                <Dashboard />
            </Router>
        );

        fireEvent.click(screen.getByText(/Exchange/i));
        expect(history.location.pathname).toBe('/exchange');
    });

    it('goes to /expenses when Expenses link is clicked', () => {
        localStorage.setItem('token', 'fake-token');
        jwt.jwtDecode.mockReturnValue({ sub: 'mousania' });

        const history = createMemoryHistory({ initialEntries: ['/dashboard'] });

        render(
            <Router location={history.location} navigator={history}>
                <Dashboard />
            </Router>
        );

        fireEvent.click(screen.getByText(/Expenses/i));
        expect(history.location.pathname).toBe('/expenses');
    });

    it('goes to /visualisation when Visualisation link is clicked', () => {
        localStorage.setItem('token', 'fake-token');
        jwt.jwtDecode.mockReturnValue({ sub: 'pattypatricia' });

        const history = createMemoryHistory({ initialEntries: ['/dashboard'] });

        render(
            <Router location={history.location} navigator={history}>
                <Dashboard />
            </Router>
        );

        fireEvent.click(screen.getByText(/Visualisation/i));
        expect(history.location.pathname).toBe('/visualisation');
    });

    it('logs out and navigates to home', () => {
        localStorage.setItem('token', 'fake-token');
        jwt.jwtDecode.mockReturnValue({ sub: 'sania' });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText(/Logout/i));
        expect(localStorage.getItem('token')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});