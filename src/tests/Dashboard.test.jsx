import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';
import * as jwt from 'jwt-decode';
import '@testing-library/jest-dom';

// Mock child components
//vi.mock('../component/AddBudgetForm', () => () => <div>AddBudgetFormMock</div>);
//vi.mock('../component/ExistingBudget', () => () => <div>ExistingBudgetMock</div>);
vi.mock('../component/AddBudgetForm', () => ({
  default: () => <div>AddBudgetFormMock</div>
}));
vi.mock('../component/ExistingBudget', () => ({
  default: () => <div>ExistingBudgetMock</div>
}));

// Mock jwtDecode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    jwt.jwtDecode.mockClear();
  });

  it('redirects to login if no token', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders username from token', async () => {
    localStorage.setItem('token', 'fake-token');
    jwt.jwtDecode.mockReturnValue({ sub: 'testuser' });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Welcome, testuser/i)).toBeInTheDocument();
  });

  it('renders AddBudgetForm and ExistingBudget', () => {
    localStorage.setItem('token', 'fake-token');
    jwt.jwtDecode.mockReturnValue({ sub: 'testuser' });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('AddBudgetFormMock')).toBeInTheDocument();
    expect(screen.getByText('ExistingBudgetMock')).toBeInTheDocument();
  });

  it('navigates to /exchange when Exchange link is clicked', () => {
    localStorage.setItem('token', 'fake-token');
    jwt.jwtDecode.mockReturnValue({ sub: 'testuser' });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Exchange/i));
    expect(mockNavigate).toHaveBeenCalledWith('/exchange');
    });

  it('logs out and navigates to home', () => {
    localStorage.setItem('token', 'fake-token');
    jwt.jwtDecode.mockReturnValue({ sub: 'testuser' });

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