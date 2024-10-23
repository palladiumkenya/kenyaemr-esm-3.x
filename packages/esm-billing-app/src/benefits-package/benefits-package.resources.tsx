import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';
import { coverageEligibilityResponse, patientBenefits } from './benefits-package.mock';
import { CoverageEligibilityResponse, InsurersBenefits } from '../types';

export const eligibilityRequestShema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  packageUUid: z.string(),
  diagnosisUuids: z.array(z.string()),
  isRefered: z.boolean(),
  interventions: z.array(z.string()),
});

export const preauthSchema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  diagnosisUuids: z.array(z.string()).nonempty('Require atleast 1 diagnoses'),
  interventions: z.array(z.string()).nonempty('Require atleast 1 intervention'),
  patientBenefit: z.string(),
});

export const requestEligibility = async (data: z.infer<typeof eligibilityRequestShema>) => {
  // const url = `${restBaseUrl}/insuranceclaims/CoverageEligibilityRequest`;
  // const resp = await openmrsFetch(url, {
  //   body: JSON.stringify(data),
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  const benefits = coverageEligibilityResponse as Array<CoverageEligibilityResponse>;
  const insurerBenefits = benefits.reduce<Array<InsurersBenefits>>(
    (prev, curr) => [...prev, ...curr.benefits.map((b) => ({ ...b, insurer: curr.insurer }))],
    [],
  );
  return insurerBenefits;
};

export const preAuthenticateBenefit = async (
  data: z.infer<typeof preauthSchema>,
  markeAsApproved: boolean,
  benefits: Array<InsurersBenefits>,
) => {
  return benefits.map((benefit) => ({
    ...benefit,
    status:
      data.patientBenefit === benefit.packageCode
        ? markeAsApproved === true
          ? 'Approved'
          : markeAsApproved === false
          ? 'REjected'
          : 'Pending'
        : benefit.status,
  }));
};
