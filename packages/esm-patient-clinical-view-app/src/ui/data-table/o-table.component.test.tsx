import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formConceptMap, mockTableHeaders, mockTableRows } from '../../../../../__mocks__/encounter-observations.mock';
import { OTable } from './o-table.component';

const testProps = {
  tableHeaders: mockTableHeaders,
  tableRows: mockTableRows,
  formConceptMap: formConceptMap,
  isExpandable: false,
};

describe('ObsTable', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render the table component', async () => {
    const user = userEvent.setup();
    render(<OTable {...testProps} />);
    expect(screen.getByText('02-Oct-2019')).toBeInTheDocument();
    expect(screen.getByText('HTS Initial Form')).toBeInTheDocument();
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Provider-initiated HIV testing and counseling')).toBeInTheDocument();
    expect(screen.getByText('PMTCT Program')).toBeInTheDocument();
    expect(screen.getByText('NEGATIVE')).toBeInTheDocument();
    expect(screen.getByText('No Signs Disease')).toBeInTheDocument();

    const expectedColumnHeaders = [
      /Test Date/,
      /Test type/,
      /Approach/,
      /Strategy/,
      /Entry point/,
      /Final result/,
      /TB screening outcome/,
      /Actions/,
    ];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const tableRowGroup = screen.getAllByRole('rowgroup');
    expect(tableRowGroup).toHaveLength(2);

    // clicking the row should expand the row
    const expandCurrentRowButton = screen.getByRole('button', { name: /Expand current row/ });
    expect(expandCurrentRowButton).toBeInTheDocument();
    await user.click(expandCurrentRowButton);
  });
});
