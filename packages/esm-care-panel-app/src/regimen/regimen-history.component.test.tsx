import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRegimenHistory } from '../hooks/useRegimenHistory';
import RegimenHistory, { RegimenHistoryProps } from './regimen-history.component';

jest.mock('../hooks/useRegimenHistory');

const mockedUseRegimenHistory = jest.mocked(useRegimenHistory);

describe('RegimenHistory Component', () => {
  const mockProps: RegimenHistoryProps = {
    patientUuid: 'patient-123',
    category: 'HIV Program',
  };

  const mockData = [
    {
      regimenShortDisplay: 'ShortDisplay',
      regimenLine: 'Line1',
      changeReasons: ['Reason1'],
      regimenUuid: 'regimen-123',
      startDate: '2021-01-01',
      endDate: '',
      regimenLongDisplay: 'LongDisplay',
      current: false,
    },
  ];

  beforeEach(() => {
    mockedUseRegimenHistory.mockReturnValue({
      regimen: mockData,
      isLoading: false,
      error: false,
    });
  });

  it('displays regimen history details correctly', () => {
    render(<RegimenHistory {...mockProps} />);

    expect(screen.getByText(mockData[0].regimenLine)).toBeInTheDocument();
    expect(screen.getByText(mockData[0].regimenShortDisplay)).toBeInTheDocument();
  });
});
