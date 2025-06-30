import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFeedback from '../component/CategoryFeedback';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('CategoryFeedback', () => {
  const categories = ['food', 'transport', 'shopping'];
  const description = 'buy lunch';
  const suggestedCategory = 'food';
  const onAccept = vi.fn();
  const onCorrection = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lets user accept the suggested category by clicking "Yes"', () => {
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

  it('shows correction dropdown when user clicks "No"', () => {
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

  it('lets user pick a different category and submit it as feedback', () => {
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
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'transport' } });
    fireEvent.click(screen.getByRole('button', { name: /submit correction/i }));
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:8000/feedback',
      { description, correct_category: 'transport' }
    );
    expect(onCorrection).toHaveBeenCalledWith('transport');
  });

  it('lets user enter a custom category and submit that as feedback', () => {
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

  it('disables submit button until a valid category is chosen', () => {
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
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'transport' } });
    expect(submitBtn).not.toBeDisabled();
  });
});
