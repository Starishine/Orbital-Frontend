import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFeedback from '../component/CategoryFeedback';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('CategoryFeedback', () => {
  const categories = ['Food', 'Transport', 'Shopping'];
  const description = 'Bought lunch';
  const suggestedCategory = 'Food';
  const onAccept = vi.fn();
  const onCorrection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls onAccept when "Yes" is clicked', () => {
    render(
      <CategoryFeedback
        description={description}
        suggestedCategory={suggestedCategory}
        categories={categories}
        onAccept={onAccept}
        onCorrection={onCorrection}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /yes/i }));
    expect(onAccept).toHaveBeenCalled();
  });

  it('shows correction UI when "No" is clicked', () => {
    render(
      <CategoryFeedback
        description={description}
        suggestedCategory={suggestedCategory}
        categories={categories}
        onAccept={onAccept}
        onCorrection={onCorrection}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('submits correction with selected category', () => {
    render(
      <CategoryFeedback
        description={description}
        suggestedCategory={suggestedCategory}
        categories={categories}
        onAccept={onAccept}
        onCorrection={onCorrection}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Transport' } });
    fireEvent.click(screen.getByRole('button', { name: /submit correction/i }));
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/feedback',
      { description, correct_category: 'Transport' }
    );
    expect(onCorrection).toHaveBeenCalledWith('Transport');
  });

  it('submits correction with custom category', () => {
    render(
      <CategoryFeedback
        description={description}
        suggestedCategory={suggestedCategory}
        categories={categories}
        onAccept={onAccept}
        onCorrection={onCorrection}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '__custom__' } });
    fireEvent.change(screen.getByPlaceholderText(/enter custom category/i), { target: { value: 'Bills' } });
    fireEvent.click(screen.getByRole('button', { name: /submit correction/i }));
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/feedback',
      { description, correct_category: 'Bills' }
    );
    expect(onCorrection).toHaveBeenCalledWith('Bills');
  });

  it('submit button is disabled until a valid correction is entered', () => {
    render(
      <CategoryFeedback
        description={description}
        suggestedCategory={suggestedCategory}
        categories={categories}
        onAccept={onAccept}
        onCorrection={onCorrection}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /no/i }));
    const submitBtn = screen.getByRole('button', { name: /submit correction/i });
    expect(submitBtn).toBeDisabled();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Transport' } });
    expect(submitBtn).not.toBeDisabled();
  });
});