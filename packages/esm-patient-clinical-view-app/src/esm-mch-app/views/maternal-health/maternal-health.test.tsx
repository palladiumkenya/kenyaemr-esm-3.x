import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigObject, openmrsFetch, useConfig, usePagination } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../../../__mocks__/patient.mock';
import { mockLabourAndDeliveryData } from '../../../../../../__mocks__/delivery-summary.mock';
import MaternalHealthList from './maternal-health.component';
import { renderWithSwr } from '../../../../../../tools/test-helpers';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockUsePagination = usePagination as jest.Mock;
const mockedUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
    })),
  };
});

describe('MCHOverview', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({
      encounterTypes: { mchMotherConsultation: 'c6d09e05-1f25-4164-8860-9f32c5a02df0' },
      formsList: {
        antenatal: {
          labourAndDelivery: '496c7cc3-0eea-4e84-a04c-2292949e2f7f',
        },
      },
    } as ConfigObject);
  });

  it('renders an empty state if MCH data is unavailable', async () => {
    renderMCHTabs();

    const antenatalTab = screen.getByRole('tab', { name: /antenatal care/i });
    const labourAndDeliveryTab = screen.getByRole('tab', { name: /labour and delivery/i });
    const postnatalTab = screen.getByRole('tab', { name: /postnatal care/i });

    expect(screen.getByRole('heading', { name: /mch clinical view/i })).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toContainElement(antenatalTab);
    expect(screen.getByRole('tablist')).toContainElement(labourAndDeliveryTab);
    expect(screen.getByRole('tablist')).toContainElement(postnatalTab);
  });

  xit(`renders a tabular overview of the patient's mch history if available`, async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce(mockLabourAndDeliveryData);
    mockUsePagination.mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: mockLabourAndDeliveryData,
    }));

    renderMCHTabs();
    expect(screen.getByRole('heading', { name: /mch clinical view/i })).toBeInTheDocument();

    const antenatalTab = screen.getByRole('tab', { name: /antenatal care/i });
    const labourAndDeliveryTab = screen.getByRole('tab', { name: /labour and delivery/i });
    const postnatalTab = screen.getByRole('tab', { name: /postnatal care/i });

    expect(screen.getByRole('tablist')).toContainElement(antenatalTab);
    expect(screen.getByRole('tablist')).toContainElement(labourAndDeliveryTab);
    expect(screen.getByRole('tablist')).toContainElement(postnatalTab);

    await user.click(labourAndDeliveryTab);

    expect(screen.getByTitle(/Empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no encounters to display/i)).toBeInTheDocument();
  });
});

function renderMCHTabs() {
  renderWithSwr(<MaternalHealthList {...testProps} />);
}
