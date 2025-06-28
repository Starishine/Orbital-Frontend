import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../pages/Home';
import '@testing-library/jest-dom';

// Mock MyProfile and MyButton for isolation
vi.mock('../pages/MyProfileDetails', () => ({
  default: ({ user }) => <div>MockProfile: {user.name}</div>
}));
vi.mock('../component/MyButton', () => ({
  default: ({ count, onClick }) => (
    <button onClick={onClick}>Count is {count}</button>
  )
}));

describe('Home Page', () => {
  it('renders Vite and React logos', () => {
    render(<Home />);
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument();
    expect(screen.getByAltText('React logo')).toBeInTheDocument();
  });

  it('renders both counter buttons and increments count', () => {
    render(<Home />);
    const buttons = screen.getAllByText(/Count is/i);
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toHaveTextContent('Count is 0');
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveTextContent('Count is 1');
    expect(buttons[1]).toHaveTextContent('Count is 1');
  });

  it('shows and hides the profile when button is clicked', () => {
    render(<Home />);
    const toggleBtn = screen.getByRole('button', { name: /show profile/i });
    expect(screen.queryByText(/MockProfile:/i)).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/MockProfile: Amarnath/i)).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.queryByText(/MockProfile:/i)).not.toBeInTheDocument();
  });

  it('renders the instructional text', () => {
    render(<Home />);
//    expect(screen.getByText(/Edit src\/App\.jsx and save to test HMR/i)).toBeInTheDocument();
   expect(
  screen.getAllByText((content, element) =>
    element.textContent.includes('Edit src/App.jsx and save to test HMR')
  ).length
).toBeGreaterThan(0);
    expect(screen.getByText(/Click on the Vite and React logos to learn more/i)).toBeInTheDocument();
  });
});