import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteBudget from '../component/DeleteBudget';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('DeleteBudget', () => {
  const budgetId = 'budget123';
  const onDeleteSuccess = vi.fn();

  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    vi.clearAllMocks();
  });

  it('calls axios.delete with correct URL and headers when confirmed', async () => {
    // Mock confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    axios.delete.mockResolvedValueOnce({
      data: { status: 'SUCCESS', code: 200 }
    });

    render(<DeleteBudget budgetId={budgetId} onDeleteSuccess={onDeleteSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /delete budget/i }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `http://localhost:8080/budget/delete/${budgetId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      );
      expect(onDeleteSuccess).toHaveBeenCalled();
    });
  });

  it('does not call axios.delete if user cancels', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<DeleteBudget budgetId={budgetId} onDeleteSuccess={onDeleteSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /delete budget/i }));
    expect(axios.delete).not.toHaveBeenCalled();
    expect(onDeleteSuccess).not.toHaveBeenCalled();
  });

  it('handles backend error ', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    axios.delete.mockRejectedValueOnce(new Error('API error'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<DeleteBudget budgetId={budgetId} onDeleteSuccess={onDeleteSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /delete budget/i }));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    consoleError.mockRestore();
  });
});
