import React from 'react';
import { render, screen } from '@testing-library/react';
import ClearCacheButton from './clear-cache.component';
import userEvent from '@testing-library/user-event';
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
    const user = userEvent.setup();
    render(<ClearCacheButton />);
    const button = await screen.findByRole('button', { name: /Reload & Clear Cache/i });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(localStorage.clear).toHaveBeenCalled();
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
