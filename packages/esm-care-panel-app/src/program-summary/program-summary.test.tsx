import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockProgram } from '../../../../__mocks__/program-summary.mock';
import { formatDate } from '@openmrs/esm-framework';
import ProgramSummary, { ProgramSummaryProps } from './program-summary.component';

jest.mock('../hooks/useProgramSummary', () => ({
  useProgramSummary: jest.fn(() => ({
    data: mockProgram,
    isError: false,
    isLoading: false,
  })),
}));

const mockFormatDate = (date) => formatDate(new Date(date));

describe('ProgramSummary Component', () => {
  const mockProps: ProgramSummaryProps = {
    patientUuid: 'patient-123',
    programName: 'HIV',
  };

  it('displays HIV program details correctly', async () => {
    render(<ProgramSummary {...mockProps} />);

    expect(screen.getByText('Current status')).toBeInTheDocument();
    expect(screen.getByText('Last viral load')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.HIV.ldlValue)).toBeInTheDocument();
    expect(screen.getByText(`(${mockFormatDate(mockProgram.HIV.ldlDate)})`)).toBeInTheDocument();
    expect(screen.getByText('Last CD4 count')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.HIV.cd4)).toBeInTheDocument();
    expect(screen.getByText(`(${mockFormatDate(mockProgram.HIV.cd4Date)})`)).toBeInTheDocument();
    expect(screen.getByText('CD4 percentage')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.HIV.cd4Percent)).toBeInTheDocument();
    expect(screen.getByText(`(${mockFormatDate(mockProgram.HIV.cd4PercentDate)})`)).toBeInTheDocument();
    expect(screen.getByText('Last WHO stage')).toBeInTheDocument();
    expect(screen.getByText('Regimen')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.HIV.lastEncDetails.regimenShortDisplay)).toBeInTheDocument();
    expect(screen.getByText('Date started regimen')).toBeInTheDocument();
    expect(screen.getByText(`01-Aug-2023`)).toBeInTheDocument();
  });

  xit('displays TB program details correctly', async () => {
    const tbProps: ProgramSummaryProps = {
      ...mockProps,
      programName: 'TB',
    };

    render(<ProgramSummary {...tbProps} />);

    expect(screen.getByText('Treatment number')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.TB.tbTreatmentNumber)).toBeInTheDocument();
    expect(screen.getByText('Disease classification')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.TB.tbDiseaseClassification)).toBeInTheDocument();
    expect(screen.getByText('Patient classification')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.TB.tbPatientClassification)).toBeInTheDocument();
  });

  it('displays MCHMOTHER program details correctly', async () => {
    const mchMotherProps: ProgramSummaryProps = {
      ...mockProps,
      programName: 'mchMother',
    };

    render(<ProgramSummary {...mchMotherProps} />);

    expect(screen.getByText('HIV status')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.mchMother.hivStatus)).toBeInTheDocument();
    expect(screen.getByText(`(${mockFormatDate(mockProgram.mchMother.hivStatusDate)})`)).toBeInTheDocument();
    expect(screen.getByText('On ART')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.mchMother.onHaart)).toBeInTheDocument();
    expect(screen.getByText(`(14-Aug-2023)`)).toBeInTheDocument();
  });

  it('displays MCHCHILD program details correctly', async () => {
    const mchChildProps: ProgramSummaryProps = {
      ...mockProps,
      programName: 'mchChild',
    };

    render(<ProgramSummary {...mchChildProps} />);

    expect(screen.getByText('HIV Status')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.mchChild.hivStatus)).toBeInTheDocument();
    expect(screen.getByText('HEI Outcome')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.mchChild.heiOutcome)).toBeInTheDocument();
    expect(screen.getByText('Milestones Attained')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.mchChild.milestonesAttained)).toBeInTheDocument();
    expect(screen.getByText(mockFormatDate(mockProgram.mchChild.milestonesAttainedDate))).toBeInTheDocument();
    expect(screen.getByText('Current feeding option')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.mchChild.currentFeedingOption)).toBeInTheDocument();
    expect(screen.getByText(mockFormatDate(mockProgram.mchChild.currentFeedingOptionDate))).toBeInTheDocument();
    expect(screen.getByText('Current prophylaxis used')).toBeInTheDocument();
    expect(screen.getByText(mockProgram.mchChild.currentProphylaxisUsed)).toBeInTheDocument();
    expect(screen.getByText(mockFormatDate(mockProgram.mchChild.currentProphylaxisUsedDate))).toBeInTheDocument();
  });
});
