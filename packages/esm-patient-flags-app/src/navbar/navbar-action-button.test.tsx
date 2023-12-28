import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavbarActionButton from './navbar-action-button.component';
import { navigate, useDebounce } from '@openmrs/esm-framework';

const mockUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useOnClickOutside: jest.fn(),
  useDebounce: jest.fn(),
}));

describe('Navbar Action Button', () => {
  test('should render navbar action button', async () => {
    const { baseElement } = renderNavbarActionButton();

    // should render the global action button
    const globalActionButton = screen.getByRole('button', { name: 'KenyaEMR Modules' });
    expect(globalActionButton).toBeInTheDocument();

    // clicking the button should open the overlay
    await userEvent.click(globalActionButton);
    expect(globalActionButton).toHaveClass(
      'cds--btn--icon-only active cds--header__action cds--btn cds--btn--primary cds--btn--icon-only cds--btn cds--btn--primary',
    );

    // should render the overlay
    const searchInput = screen.getByRole('searchbox', { name: 'Search for a module' });
    expect(searchInput).toBeInTheDocument();
    const kenyaemrLinks = [
      'System Info',
      'KenyaEMR Home',
      'Facility Dashboard',
      'Clear Cache',
      'Form Builder',
      'Legacy Admin',
      'Manage Stocks',
    ];
    kenyaemrLinks.forEach((link) => {
      const navLink = screen.getByRole('button', { name: link });
      expect(navLink).toBeInTheDocument();
    });

    // should be able to search for a link
    const searchBox = screen.getByRole('searchbox', { name: 'Search for a module' });
    await userEvent.type(searchBox, 'System Info');
    expect(searchBox).toHaveValue('System Info');

    const formBuilderLink = screen.queryByRole('button', { name: 'Form Builder' });
    expect(formBuilderLink).not.toBeInTheDocument();

    // Clearing the search box should show all links
    await userEvent.clear(searchBox);
    expect(searchBox).toHaveValue('');

    // should display empty state if no results are found
    await userEvent.type(searchBox, 'No results');
    const emptyState = screen.getByText('There are no links to display that match the search criteria');
    expect(emptyState).toBeInTheDocument();

    // clicking clear search should show all links
    const clearSearchButton = screen.getByRole('button', { name: 'Clear search' });
    await userEvent.click(clearSearchButton);
    expect(searchBox).toHaveValue('');
    expect(emptyState).not.toBeInTheDocument();

    // clicking the navlink should navigate to a page
    const systemInfoLink = screen.getByRole('button', { name: 'System Info' });
    await userEvent.click(systemInfoLink);
    expect(navigate).toHaveBeenCalledWith({ to: '/openmrs/spa/about' });
  });
});

function renderNavbarActionButton() {
  return render(<NavbarActionButton />);
}
