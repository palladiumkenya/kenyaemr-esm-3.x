import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { updateRelationship } from '../../relationships/relationship.resources';
import { showSnackbar } from '@openmrs/esm-framework';
import EndRelationshipModal from './case-management-modal.component';
import { SWRConfig } from 'swr';

jest.mock('../../relationships/relationship.resources', () => ({
  updateRelationship: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
}));

describe('EndRelationshipModal', () => {
  const mockCloseModal = jest.fn();
  const mockRelationshipUuid = 'test-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with the correct content', () => {
    render(<EndRelationshipModal closeModal={mockCloseModal} relationshipUuid={mockRelationshipUuid} />);

    expect(screen.getByText(/end relationship/i)).toBeInTheDocument();
    expect(screen.getByText(/this will end the relationship. are you sure you want to proceed\?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
  });

  it('closes the modal when the No button is clicked', () => {
    render(<EndRelationshipModal closeModal={mockCloseModal} relationshipUuid={mockRelationshipUuid} />);

    const noButton = screen.getByRole('button', { name: /no/i });
    fireEvent.click(noButton);

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});
