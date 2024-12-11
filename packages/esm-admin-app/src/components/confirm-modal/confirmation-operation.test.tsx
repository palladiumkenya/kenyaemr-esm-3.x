import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslation } from 'react-i18next';
import OperationConfirmation from './confirmation-operation-modal.component';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

describe('OperationConfirmation', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: (key, defaultValue, options) =>
        options?.operationTypeOrName ? `Do you want to ${options.operationTypeOrName}?` : defaultValue || key,
    });
  });

  it('renders the component with provided props', () => {
    const closeMock = jest.fn();
    const confirmMock = jest.fn();
    const operationName = 'refresh';
    const operationType = 'refreshed';

    render(
      <OperationConfirmation
        close={closeMock}
        confirm={confirmMock}
        operationName={operationName}
        operationType={operationType}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Confirmation' })).toBeInTheDocument();
    expect(screen.getByText('Do you want to refreshed?')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('calls close when the No button is clicked', () => {
    const closeMock = jest.fn();
    const confirmMock = jest.fn();

    render(
      <OperationConfirmation close={closeMock} confirm={confirmMock} operationName="delete" operationType="deleted" />,
    );

    const noButton = screen.getByText('No');
    fireEvent.click(noButton);

    expect(closeMock).toHaveBeenCalledTimes(1);
    expect(confirmMock).not.toHaveBeenCalled();
  });

  it('calls confirm when the Yes button is clicked', () => {
    const closeMock = jest.fn();
    const confirmMock = jest.fn();

    render(
      <OperationConfirmation close={closeMock} confirm={confirmMock} operationName="delete" operationType="deleted" />,
    );

    const yesButton = screen.getByText('Yes');
    fireEvent.click(yesButton);

    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(closeMock).not.toHaveBeenCalled();
  });
});
