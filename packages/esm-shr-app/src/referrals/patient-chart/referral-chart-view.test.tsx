import React from 'react';
import { screen, render } from '@testing-library/react';
import ReferralReasonsView from './referral-chart-view.component';
import * as resource from '../refferals.resource';
import * as mock from '@openmrs/esm-framework/mock';

jest.mock('../refferals.resource');

jest.spyOn(mock, 'useConfig').mockReturnValue({
  nationalPatientUniqueIdentifier: '12f85081e2-b4be-4e48-b3a4-7994b69bb101',
});

const mockFhirPatient = {
  resourceType: 'Patient',
  id: '97ae7880-ab78-43e1-aa4b-fc8f723ef0f4',
  meta: {
    versionId: '1718300661000',
    lastUpdated: '2024-06-13T20:44:21.000+03:00',
    tag: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
        code: 'SUBSETTED',
        display: 'Resource encoded in summary mode',
      },
    ],
  },
  identifier: [
    {
      id: 'd364a3de-24b8-403c-b710-5361199f06e6',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/patient/identifier#location',
          valueReference: {
            reference: 'Location/47a2e333-319d-49e0-8724-46ea90cd4750',
            type: 'Location',
            display: 'Alupe Sub County Referral Hospital',
          },
        },
      ],
      use: 'official',
      type: {
        coding: [
          {
            code: 'dfacd928-0370-4315-99d7-6ec1c9f7ae76',
          },
        ],
        text: 'OpenMRS ID',
      },
      value: 'MGMX47',
    },
    {
      id: '0fe5b17c-a835-4729-8d50-d7b35d6ea1c9',
      extension: [
        {
          url: 'http://fhir.openmrs.org/ext/patient/identifier#location',
          valueReference: {
            reference: 'Location/47a2e333-319d-49e0-8724-46ea90cd4750',
            type: 'Location',
            display: 'some test location',
          },
        },
      ],
      use: 'usual',
      type: {
        coding: [
          {
            code: '12f85081e2-b4be-4e48-b3a4-7994b69bb101',
          },
        ],
        text: 'National Unique patient identifier',
      },
      value: 'TESTR1GKLR6865',
    },
  ],
  active: true,
  name: [
    {
      id: 'b7090a2b-2ff9-4af3-b6c8-d322dbcd8eea',
      family: 'karegethe',
      given: ['karegethe', 'karegethe'],
    },
  ],
  gender: 'female',
  birthDate: '2015-01-26',
  deceasedBoolean: false,
};

const mockReferral = {
  status: 'COMPLETED',
  referralReasons: {
    category: 'Outpatient Department',
    reasonCode: 'Fever',
    referralDate: '2024-03-31',
    clinicalNote:
      'fever duration: 1, has taken al: no, rdt result: not_done, is screened cancer: no, has observed signs of violence: no',
  },
  referredFrom: 'Community',
};

describe('ReferralReasonsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show missing national unique patient identifier message if patient does not have one assigned', () => {
    jest
      .spyOn(resource, 'useCommunityReferral')
      .mockReturnValue({ isError: null, isLoading: false, isValidating: false, referral: null as any });
    render(<ReferralReasonsView patient={{ ...mockFhirPatient, identifier: [] }} />);
    expect(screen.getByText('Referrals')).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes('The patient is missing national patient unique identifier (NUPI)'),
      ),
    ).toBeInTheDocument();
  });

  test('should show referral data if patient has a national unique patient identifier assigned', () => {
    jest
      .spyOn(resource, 'useCommunityReferral')
      .mockReturnValue({ isError: null, isLoading: false, isValidating: false, referral: mockReferral as any });
    render(<ReferralReasonsView patient={mockFhirPatient} />);
    expect(screen.getByText('Referrals')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Reason Code')).toBeInTheDocument();
    expect(screen.getByText('Clinical Note')).toBeInTheDocument();
    expect(screen.getByText('Referred From')).toBeInTheDocument();

    expect(screen.getByText(mockReferral.referredFrom)).toBeInTheDocument();
    expect(screen.getByText(mockReferral.status)).toBeInTheDocument();
    expect(screen.getByText(mockReferral.referralReasons.reasonCode)).toBeInTheDocument();
    expect(screen.getByText(mockReferral.referralReasons.clinicalNote)).toBeInTheDocument();
    expect(screen.getByText(mockReferral.referredFrom)).toBeInTheDocument();
  });
});
