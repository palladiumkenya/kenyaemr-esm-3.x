import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import ClearCacheButton from './clear-cache.component';

// Mocking window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
});

describe('ClearCacheButton', () => {
  beforeEach(() => {
    // Clear localStorage and sessionStorage mocks before each test
    Storage.prototype.clear = jest.fn();
  });

  it('clears local and session storage and reloads the page when clicked', async () => {
    const { container } = render(<ClearCacheButton />);
    const button = await screen.findByRole('button', { name: /Reload & Clear Cache/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    expect(localStorage.clear).toHaveBeenCalled();
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
