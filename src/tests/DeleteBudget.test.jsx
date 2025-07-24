import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteBudget from '../component/DeleteBudget';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('DeleteBudget', () => {
  const budgetId = 'saniasbudget';
  const onDeleteSuccess = vi.fn();

  beforeEach(() => {
    localStorage.setItem('token', 'test_token');
    vi.clearAllMocks();
  });

  it('deletes the budget if the user confirms the action of deletion', async () => {
    // Mock confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    axios.delete.mockResolvedValueOnce({
      data: { status: 'SUCCESS', code: 200 }
    });

    render(<DeleteBudget budgetId={budgetId} onDeleteSuccess={onDeleteSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /delete budget/i }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        `/api/budget/delete/${budgetId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test_token'
          })
        })
      );
      expect(onDeleteSuccess).toHaveBeenCalled();
    });
  });

  it('does nothing if the user cancels the delete confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<DeleteBudget budgetId={budgetId} onDeleteSuccess={onDeleteSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /delete budget/i }));
    expect(axios.delete).not.toHaveBeenCalled();
    expect(onDeleteSuccess).not.toHaveBeenCalled();
  });

  it('handles any error that arises if the delete request to the backend server fails', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    axios.delete.mockRejectedValueOnce(new Error('API error'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
    render(<DeleteBudget budgetId={budgetId} onDeleteSuccess={onDeleteSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /delete budget/i }));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    consoleError.mockRestore();
  });
});
