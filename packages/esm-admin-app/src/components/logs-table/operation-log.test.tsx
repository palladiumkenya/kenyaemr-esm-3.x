import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useLogData } from './operation-log-resource-mock-data';
import LogTable from './operation-log-table.component';

jest.mock('./operation-log-resource-mock-data', () => ({
  useLogData: jest.fn(),
}));

describe('LogTable Component', () => {
  beforeEach(() => {
    (useLogData as jest.Mock).mockReturnValue([
      {
        procedure: 'Initial Population of Tables',
        startTime: '2024-11-28T09:30:12',
        endTime: '2024-11-28T09:33:15',
        completionStatus: 'Success',
      },
      {
        procedure: 'Initial Creation of Tables',
        startTime: '2024-11-28T09:30:12',
        endTime: '2024-11-28T09:33:15',
        completionStatus: 'Failed',
      },
    ]);
  });

  it('renders the table with correct headers and rows', () => {
    render(<LogTable />);

    const headers = ['Procedure', 'Start time', 'End time', 'Completion status'];
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3);
  });
});
