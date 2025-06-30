import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, test, beforeEach, afterEach, expect } from 'vitest'
import MainApp from '../pages/MainApp'
import '@testing-library/jest-dom';


const mockNavigate = vi.fn() // fake function imitating usenavigate lol
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate, // every time useNavigate used from react-router-dom, don’t use the real one- use this fake mockNavigate instead.
}))

vi.mock('../component/SignupForm', () => ({
    default: ({ onSuccess }) => (
        <button onClick={() => onSuccess({ username: 'mousania' })}>MockSignupForm</button>
    ), // creatinng fake components (sort of imitating)
}))
vi.mock('../component/SignInForm', () => ({
    default: ({ onSuccess, onSwitchToSignUp }) => (
        <div>
            <button onClick={() => onSuccess({ username: 'fatty' }, 'token123')}>MockSignInForm</button>
            <button onClick={onSwitchToSignUp}>SwitchToSignUp</button>
        </div>
    ),
}))

beforeEach(() => {
    vi.clearAllMocks() //Clears the call history and behavior of all mock functions made with vi.fn() or vi.spyOn()
    // recreate a fack localstorage (gotta define it properly)
    const store = {}
    vi.stubGlobal('localStorage', {
        getItem: vi.fn((keys) => store[keys]),
        setItem: vi.fn((keys, value) => { store[keys] = value }),
        removeItem: vi.fn((keys) => { delete store[keys] }),
        clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
    }) // key value pairs in the local store
})

afterEach(() => {
    vi.resetAllMocks()
})

test('shows logo, headings, and SignInForm by default', () => {
    render(<MainApp />)
    expect(screen.getByAltText(/money tree/i)).toBeInTheDocument()
    expect(screen.getByText(/BudgetBuddy/i)).toBeInTheDocument()
    expect(screen.getByText(/Your university finance planner/i)).toBeInTheDocument()
    // expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Signup/i).length).toBeGreaterThan(0); // this is better than the above one cos theres signup and signin form
    expect(screen.getByText(/MockSignInForm/i)).toBeInTheDocument()
})

test('switches to SignupForm when SwitchToSignUp is clicked', () => {
    render(<MainApp />)
    fireEvent.click(screen.getByText(/SwitchToSignUp/i))
    //expect(screen.getByText(/Signup/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Signup/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/MockSignupForm/i)).toBeInTheDocument()
})

test('logs user in, saves token, and redirects to dashboard', () => {
    render(<MainApp />)
    fireEvent.click(screen.getByText(/MockSignInForm/i))
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token123') // toHaveBeenCalledWith - checks if the function was called with the token blah blah parameters
    expect(localStorage.setItem).toHaveBeenCalledWith('currency', 'SGD')
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
})

test('alerts signup success, resets form, and goes to homepage', () => {
    window.alert = vi.fn()
    render(<MainApp />)
    fireEvent.click(screen.getByText(/SwitchToSignUp/i))
    fireEvent.click(screen.getByText(/MockSignupForm/i))
    expect(window.alert).toHaveBeenCalledWith('Signup Successful! Please log in, mousania')
    expect(mockNavigate).toHaveBeenCalledWith('/')
    expect(screen.getAllByText(/Signup/i).length).toBeGreaterThan(0);
    //expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
})

test('auto-redirects to dashboard if user is already logged in', () => {
    localStorage.getItem.mockImplementation((key) => key === 'token' ? 'some_token' : null)
    render(<MainApp />)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
})