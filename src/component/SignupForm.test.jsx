import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from './SignupForm';
import axios from 'axios';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('axios');

describe('SignupForm', () => {
  let onSuccess;

  beforeEach(() => {
    onSuccess = vi.fn();
  });

  it('renders all input fields and button', () => {
    render(<SignupForm onSuccess={onSuccess} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows error if fields are empty', async () => {
    render(<SignupForm onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/please enter user name/i)).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<SignupForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass2' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
  
  it('shows error if email is invalid', async () => {
    render(<SignupForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    screen.debug();
    expect(
  await screen.findByText((text) => text.includes('valid email address'))
).toBeInTheDocument();
  });

  it('calls onSuccess on successful signup', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        status: 'SUCCESS',
        code: 200,
        data: { username: 'user' }
      }
    });
    render(<SignupForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ username: 'user' });
    });
  });

  it('shows backend error message on failed signup', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        status: 'FAIL',
        code: 400,
        message: 'Username already exists'
      }
    });
    render(<SignupForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/username already exists/i)).toBeInTheDocument();
  });

  it('shows error if axios throws', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: 'Server error' }
    });
    render(<SignupForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@email.com' } });
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  it('navigates to sign in page when "Sign In" is clicked', () => {
    delete window.location;
    window.location = { href: '' };
    render(<SignupForm onSuccess={onSuccess} />);
    fireEvent.click(screen.getByText(/sign in/i));
    expect(window.location.href).toBe('/');
  });
});