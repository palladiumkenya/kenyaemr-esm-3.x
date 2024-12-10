import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LogTable from './operation-log-table.component';
import { ETLResponse } from '../../types';

describe('LogTable Component', () => {
  const mockLogData: ETLResponse[] = [
    {
      script_name: 'Initial Population of Tables',
      start_time: '2024-11-28T09:30:12',
      stop_time: '2024-11-28T09:33:15',
      status: 'Success',
    },
    {
      script_name: 'Initial Creation of Tables',
      start_time: '2024-11-28T09:30:12',
      stop_time: '2024-11-28T09:33:15',
      status: 'Failed',
    },
  ];

  it('renders the table with correct headers and rows', () => {
    render(<LogTable logData={mockLogData} isLoading={false} />);

    const headers = ['Procedure', 'Start time', 'End time', 'Completion status'];
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3);
  });

  it('displays "No ETL Operation logs found" when logData is empty', () => {
    render(<LogTable logData={[]} isLoading={false} />);

    expect(screen.getByText('No ETL Operation logs found')).toBeInTheDocument();
  });

  it('shows skeleton loading state when isLoading is true', () => {
    render(<LogTable logData={[]} isLoading={true} />);

    const skeleton = screen.getByLabelText('etl table');
    expect(skeleton).toBeInTheDocument();
  });
});
