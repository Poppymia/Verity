import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Verity frontend', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the home page by default', () => {
    render(<App />);
    expect(screen.getByText('Navigate the web with confidence.')).toBeInTheDocument();
    expect(screen.getByText('We verify the facts.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });

  it('navigates to Product page when clicking navigation', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Product' }));
    expect(
      screen.getByText('The complete truth verification toolkit')
    ).toBeInTheDocument();
  });

  it('navigates to History page and shows empty state', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'History' }));

    expect(screen.getByRole('heading', { name: 'History' })).toBeInTheDocument();
    expect(screen.getByText('No history yet')).toBeInTheDocument();
    expect(screen.getByText(/Extension not detected/i)).toBeInTheDocument();
  });
});

