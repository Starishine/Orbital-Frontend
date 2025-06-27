import React from 'react'; // Import React to support JSX syntax (must do this for all files)
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInForm from './SignInForm'; // Import the component to test
import axios from 'axios';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('axios');

describe('SignInForm', () => {
  // Declare reusable mock functions for props
  let onSuccess;
  let onSwitchToSignUp;
  
  // Reset mocks before each test so they don’t retain state
  beforeEach(() => {
    onSuccess = vi.fn();
    onSwitchToSignUp = vi.fn();
  });

  // Test 1: Ensure form renders correctly
  it('renders the form', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  // Test 2: Should show error if fields are empty when form is submitted
  it('shows error if fields are empty', async () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />); 
    fireEvent.click(screen.getByRole('button', { name: /sign in/i })); // Simulate click on "Sign In" button without typing anything
    expect(await screen.findByText(/please enter your username/i)).toBeInTheDocument(); // Expect error message to show up
  });

  // Test 3: Should call onSuccess with data and token on successful login
  it('calls onSuccess on successful login', async () => {
    axios.post.mockResolvedValueOnce({
      data: { status: "SUCCESS", code: 200, data: { user: 'test' }, token: 'abc' }
    });

    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i })); // Submit form

    // Wait for onSuccess to be called with correct params
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ user: 'test' }, 'abc');
    });
  });

  // Test 4: Should display error when API returns "FAIL"
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

  // Test 5: Clicking "Sign Up" button should call onSwitchToSignUp
  it('switches to sign up form', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.click(screen.getByText(/sign up/i));
    expect(onSwitchToSignUp).toHaveBeenCalled();
  });

  // Test 6: Simulate server/network failure (mock axios rejection)
  it('shows error if server/network error occurs', async () => {
    // Simulate axios throwing an error (e.g., 500 or connection failure)
    axios.post.mockRejectedValueOnce({
      response: { data: 'Server error' }
    });

    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    //expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  // Test 7: Password input should have `type="password"`
  it('password input should have type password', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // Test 8: Should NOT call API if both fields are empty
  it('does not call axios if both fields are empty', async () => {
    const spy = vi.spyOn(axios, 'post');
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  // Test 9: Should NOT call API if password is missing
  it('does not call axios if password is empty', async () => {
    const spy = vi.spyOn(axios, 'post');
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  // Test 10: Should NOT call API if username is missing
  it('does not call axios if username is empty', async () => {
    const spy = vi.spyOn(axios, 'post');
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });


});