import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInForm from './SignInForm';
import axios from 'axios';
import { expect, vitest } from 'vitest';
import '@testing-library/jest-dom';


vitest.mock('axios');

describe('SignInForm', () => {
  const onSuccess = vitest.fn();
  const onSwitchToSignUp = vitest.fn();

  beforeEach(() => {
    onSuccess.mockClear();
    onSwitchToSignUp.mockClear();
  });

  it('renders the form', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('shows error if fields are empty', async () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/please enter your username/i)).toBeInTheDocument();
  });

  it('calls onSuccess on successful login', async () => {
    axios.post.mockResolvedValueOnce({
      data: { status: "SUCCESS", code: 200, data: { user: 'test' }, token: 'abc' }
    });

    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ user: 'test' }, 'abc');
    });
  });

  it('shows error on failed login', async () => {
    axios.post.mockResolvedValueOnce({
      data: { status: "FAIL", code: 401, message: "Invalid credentials" }
    });

    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'baduser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('switches to sign up form', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.click(screen.getByText(/sign up/i));
    expect(onSwitchToSignUp).toHaveBeenCalled();
  });
});