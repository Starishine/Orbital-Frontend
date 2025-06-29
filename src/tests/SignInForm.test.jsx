import React from 'react'; // Import React to support JSX syntax (must do this for all files)
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInForm from '../component/SignInForm'; // Import the component to test
import axios from 'axios'; //JavaScript library used to make HTTP requests from the browser (or Node.js) to a backend server or API.
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('axios'); //tells vitest to mock the entire axios module 

describe('SignInForm', () => {
  // Declare reusable mock functions for props
  let onSuccess;
  let onSwitchToSignUp;

  // Reset mocks before each test so they don’t retain state
  beforeEach(() => {
    onSuccess = vi.fn();
    onSwitchToSignUp = vi.fn();
  });

  // render - simulates how your component would appear and behave in a real browser.
  //        - lets you make assertions about what is shown on the screen.
  // expect - used to make assertions about the rendered output.
  // screen - provides access to the rendered output, allowing you to query elements by their text
  // fireEvent - simulates user interactions like clicks, typing, etc.
  // waitFor - waits for a condition to be met before proceeding, useful for asynchronous operations like API calls.
  // toBeInTheDocument - a custom matcher from jest-dom that checks if an element is present in the document.
  // Test 1: ensure form renders correctly
  it('renders the form', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument(); // basically checks if all components of the signinform are available on the page
  });

  // Test 2: should show error if fields are empty when form is submitted
  it('shows error if fields are empty', async () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i })); // simulate click on "sign in" button without typing anything
    expect(await screen.findByText(/please enter your username/i)).toBeInTheDocument(); // expected error message to show up
  });

  // Test 3: should call onSuccess with data and token on successful login
  //mockResolvedValueOnce - mocks the axios.post method to return a resolved promise with specified data
  it('calls onSuccess on successful login', async () => {
    axios.post.mockResolvedValueOnce({
      data: { status: "SUCCESS", code: 200, data: { user: 'test' }, token: 'abc' }
    }); // faking the correct output when login works

    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />); // render the SignInForm component
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } }); // simulate user typing in username as testuser
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i })); // Submit form


    await waitFor(() => { // wait and check if the onSuccess has been called with right name and pwd
      expect(onSuccess).toHaveBeenCalledWith({ user: 'test' }, 'abc');
    });
  });

  // Test 4: should display error when API returns "FAIL"
  it('shows error on failed login', async () => { //async function to handle the API call
    axios.post.mockResolvedValueOnce({
      data: { status: "FAIL", code: 401, message: "Invalid credentials" }
    });

    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'baduser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'badpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument(); // check if error message is displayed
  });

  // Test 5: clickin "Sign Up" button should call onswitchtosignup
  it('switches to sign up form', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.click(screen.getByText(/sign up/i));
    expect(onSwitchToSignUp).toHaveBeenCalled();
  });

  // Test 6: simulate server/network failure (mock axios rejection)
  it('shows error if server/network error occurs', async () => {
    // simulate axios throwing an error
    axios.post.mockRejectedValueOnce({
      response: { data: 'Server error' }
    });

    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  // Test 7: password input should have `type="password"`
  it('password input should have type password', () => {
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // Test 8: should NOT call API if both fields are empty
  // spyOn - Creates a mock func that tracks calls to the specified method
  // mockRestore - restores the original method aft the test
  it('does not call axios if both fields are empty', async () => {
    const spy = vi.spyOn(axios, 'post'); // tracks calls to axios.post
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />); // imitate signin form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i })); // simulate clicking button without filling in requird fields
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore(); // restore og axios
  });

  // Test 9: should NOT call API if password is missing
  it('does not call axios if password is empty', async () => {
    const spy = vi.spyOn(axios, 'post');
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />);
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'user' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  // Test 10: should NOT call API if username is missing
  it('does not call axios if username is empty', async () => {
    const spy = vi.spyOn(axios, 'post'); //monitors for call to axios.post
    render(<SignInForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />); // render the signinform component
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } }); // simulate user typing in password without proper fields 
    fireEvent.click(screen.getByRole('button', { name: /sign in/i })); // pretend to press button
    expect(spy).not.toHaveBeenCalled(); // axios should not have been called
    spy.mockRestore(); // restore the original axios.post method after the test
  });


});