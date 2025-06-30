import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '../component/SignupForm';
import axios from 'axios';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('axios'); // sort of tells vitest to mock the entire axios module so that we can control its behavior in tests

describe('SignupForm', () => { // checking if every part of the page is there initially
    let onSuccess;

    beforeEach(() => {
        onSuccess = vi.fn();
    });

    it('all input fields and button are present', () => {
        render(<SignupForm onSuccess={onSuccess} />);
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('shows error if fields are not filled up', async () => {
        render(<SignupForm onSuccess={onSuccess} />);
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
        expect(await screen.findByText(/please enter user name/i)).toBeInTheDocument(); // checks if the error message is displayed when the user clicks on the sign up button without entering any data
    });

    it('shows error if passwords do not match', async () => {
        render(<SignupForm onSuccess={onSuccess} />);
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'fatty' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'moushami123' } }); // ^ means start of the string and $ means end of the string
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password2' } }); // password typed for the second is ovbiously not the same. 
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fatty@email.com' } });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
        expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument(); // checks for error message when passwords entered dont match
    });

    // check if email input is of type email to ensure proper validation
    it('email input is of correct type email', () => {
        render(<SignupForm onSuccess={vi.fn()} />); // vi.fn - creates a fake function that remembers what happened to it
        const emailInput = screen.getByLabelText(/email/i);
        expect(emailInput).toHaveAttribute('type', 'email'); // toHaveAttribute - checks the type of the email input
    });

    it('calls onSuccess if signup is successful', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                status: 'SUCCESS',
                code: 200,
                data: { username: 'fatty' }
            } // mimicking the response from backend when signup ends up being successful
        });
        render(<SignupForm onSuccess={onSuccess} />);
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'fatty' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'pass' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pass' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fatty@email.com' } });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        await waitFor(() => {
            expect(onSuccess).toHaveBeenCalledWith({ username: 'fatty' });
        });
    });

    it('shows backend error message when signup fails', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                status: 'FAIL',
                code: 400,
                message: 'Username already exists'
            }
        });
        render(<SignupForm onSuccess={onSuccess} />);
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'fatty' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'moushami123' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'moushami123' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fatty@email.com' } });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByText(/username already exists/i)).toBeInTheDocument();
    });

    it('shows error that axios might throw', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: 'Server error' }
        }); // mimicking a server error response
        render(<SignupForm onSuccess={onSuccess} />);
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'fatty' } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'moushami123' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'moushami123' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fatty@email.com' } });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        expect(await screen.findByText(/server error/i)).toBeInTheDocument();
    });

    // Checks whethr username must be at least 3 characters and password at least 6 characters
    it('shows error if username or password is too short', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                status: 'ERROR',
                code: 400,
                message: 'Username must be at least 3 characters and password at least 6 characters'
            }
        });
        render(<SignupForm onSuccess={onSuccess} />);
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'mo' } }); // too short
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: '480' } }); // too short
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: '480' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fatty@email.com' } });
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        expect(
            await screen.findByText(/username must be at least 3 characters and password at least 6 characters/i)
        ).toBeInTheDocument();
    });

    it('goes to sign in page when sign in button is clicked', () => {
        delete window.location;
        window.location = { href: '' };
        render(<SignupForm onSuccess={onSuccess} />);
        fireEvent.click(screen.getByText(/sign in/i));
        expect(window.location.href).toBe('/');
    });
});