import React from 'react';
import { render, screen } from '@testing-library/react';
import RegimenHistory, { RegimenHistoryProps } from './regimen-history.component';

describe('RegimenHistory Component', () => {
  const mockProps: RegimenHistoryProps = {
    patientUuid: 'patient-123',
    category: 'HIV Program',
  };
  const mockData = [
    {
      regimenShortDisplay: 'ShortDisplay',
      regimenLine: 'Line1',
      changeReasons: '[Reason1]',
    },
  ];
  it('renders without crashing', () => {
    jest.spyOn(require('../hooks/useRegimenHistory'), 'useRegimenHistory').mockReturnValue({
      regimen: mockData,
      isLoading: false,
      error: false,
    });
    render(<RegimenHistory {...mockProps} />);
    expect(screen.getByText('Regimen History')).toBeInTheDocument();
  });

  it('displays regimen history details correctly', () => {
    jest.spyOn(require('../hooks/useRegimenHistory'), 'useRegimenHistory').mockReturnValue({
      regimen: mockData,
      isLoading: false,
      error: false,
    });
    render(<RegimenHistory {...mockProps} />);
    expect(screen.getByText(mockData[0].regimenLine)).toBeInTheDocument();
    expect(screen.getByText(mockData[0].regimenShortDisplay)).toBeInTheDocument();
  });
});
