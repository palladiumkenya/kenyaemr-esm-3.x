import { z } from 'zod';
import { PatientBenefit } from '../types';
import { patientBenefits } from './benefits-package.mock';

export const eligibilityRequestShema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  packageUUid: z.string(),
  diagnosisUuids: z.array(z.string()),
  isRefered: z.boolean(),
  intervensions: z.array(z.string()),
});

export const preauthSchema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  diagnosisUuids: z.array(z.string()).nonempty('Require atleast 1 diagnoses'),
  intervensions: z.array(z.string()).nonempty('Require atleast 1 intervension'),
  patientBenefit: z.string(),
});

export const requestEligibility = async (data: z.infer<typeof eligibilityRequestShema>) => {
  return [...patientBenefits] as Array<PatientBenefit>;
};

export const preAuthenticateBenefit = async (data: z.infer<typeof preauthSchema>, markeAsApproved?: boolean) => {
  return patientBenefits.map((benefit) => ({
    ...benefit,
    status:
      data.patientBenefit === benefit.shaPackageCode
        ? markeAsApproved === true
          ? 'APPROVED'
          : markeAsApproved === false
          ? 'REJECTED'
          : 'PENDING'
        : benefit.status,
  }));
};
