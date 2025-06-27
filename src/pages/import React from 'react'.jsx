import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, test, beforeEach, afterEach, expect } from 'vitest'
import MainApp from './MainApp'

// language: jsx

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}))

// Mock child components
vi.mock('../component/SignupForm', () => ({
  default: ({ onSuccess }) => (
    <button onClick={() => onSuccess({ username: 'newuser' })}>MockSignupForm</button>
  ),
}))
vi.mock('../component/SignInForm', () => ({
  default: ({ onSuccess, onSwitchToSignUp }) => (
    <div>
      <button onClick={() => onSuccess({ username: 'user' }, 'token123')}>MockSignInForm</button>
      <button onClick={onSwitchToSignUp}>SwitchToSignUp</button>
    </div>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
  // Mock localStorage
  const store = {}
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key) => store[key]),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]) }),
  })
})

afterEach(() => {
  vi.resetAllMocks()
})

test('renders logo, headings, and SignInForm by default', () => {
  render(<MainApp />)
  expect(screen.getByAltText(/money tree/i)).toBeInTheDocument()
  expect(screen.getByText(/BudgetBuddy/i)).toBeInTheDocument()
  expect(screen.getByText(/Your university finance planner/i)).toBeInTheDocument()
  expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
  expect(screen.getByText(/MockSignInForm/i)).toBeInTheDocument()
})

test('switches to SignupForm when SwitchToSignUp is clicked', () => {
  render(<MainApp />)
  fireEvent.click(screen.getByText(/SwitchToSignUp/i))
  expect(screen.getByText(/Signup/i)).toBeInTheDocument()
  expect(screen.getByText(/MockSignupForm/i)).toBeInTheDocument()
})

test('handleAuthSuccess sets localStorage and navigates', () => {
  render(<MainApp />)
  fireEvent.click(screen.getByText(/MockSignInForm/i))
  expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token123')
  expect(localStorage.setItem).toHaveBeenCalledWith('currency', 'SGD')
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
})

test('handleSignupSuccess shows alert, resets form, and navigates', () => {
  window.alert = vi.fn()
  render(<MainApp />)
  fireEvent.click(screen.getByText(/SwitchToSignUp/i))
  fireEvent.click(screen.getByText(/MockSignupForm/i))
  expect(window.alert).toHaveBeenCalledWith('Signup Successful! Please log in, newuser')
  expect(mockNavigate).toHaveBeenCalledWith('/')
  expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
})

test('redirects to /dashboard if token exists in localStorage', () => {
  localStorage.getItem.mockImplementation((key) => key === 'token' ? 'sometoken' : null)
  render(<MainApp />)
  expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
})