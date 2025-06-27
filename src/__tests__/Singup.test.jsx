import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, test, beforeEach, afterEach, expect } from 'vitest'
import Signup from '../App'  


beforeEach(() => {
  global.fetch = vi.fn()
})

afterEach(() => {
  vi.resetAllMocks()
})

test('displays error when username is already taken', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 400,
    json: async () => ({ message: 'Username already taken' })
  })

  render(<Signup />)

 
  await userEvent.type(screen.getByPlaceholderText(/username/i), 'takenUser')
  await userEvent.type(screen.getByPlaceholderText(/password/i), 'password123')
  await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com')

  await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

  // ✅ Check for error
  const errorMsg = await screen.findByText(/username already taken/i)
  expect(errorMsg).toBeInTheDocument()
})
