import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NavbarActionButton from './navbar-action-button.component';

describe('Navbar Action Button', () => {

    test("should render navbar action button", () => {
        renderNavbarActionButton();
    })
})

function renderNavbarActionButton() {
    render(<NavbarActionButton />);
}