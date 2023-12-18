import React from 'react';
import { screen, render } from '@testing-library/react';
import KenyaEMRChartLink from './kenyaemr-chart-link.component';
import { navigate } from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';
import { usePatientId } from '../hooks/usePatientId';

const mockNavigate = navigate as jest.MockedFunction<typeof navigate>;
const mockUsePatientid = usePatientId as jest.MockedFunction<typeof usePatientId>;

jest.mock('@openmrs/esm-framework', () => ({
  navigate: jest.fn(),
}));

jest.mock('../hooks/usePatientId', () => {
  const originalModule = jest.requireActual('../hooks/usePatientId');
  return { ...originalModule, usePatientId: jest.fn() };
});

describe('KenyaEMRChartLink', () => {
  test('renders KenyaEMRChartLink component', async () => {
    const user = userEvent.setup();
    mockUsePatientid.mockReturnValue({ isLoading: false, patient: { patientId: '1234', age: 20 }, error: null });
    render(<KenyaEMRChartLink />);
    const link = screen.getByRole('button', { name: /2.x Chart/i });
    expect(link).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    await user.click(link);
    expect(mockNavigate).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/openmrs/kenyaemr/chart/chartViewPatient.page?patientId=1234&' });
  });
});
