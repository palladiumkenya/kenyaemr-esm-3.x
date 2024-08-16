import { z } from 'zod';
import { PatientBenefit } from '../types';
import { patientBenefits } from './benefits-package.mock';

export const eligibilityRequestShema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  packageUUid: z.string(),
  diagnosisUuids: z.array(z.string().uuid()),
  isRefered: z.boolean(),
  intervensions: z.array(z.string()),
});

export const requestEligibility = async (data: z.infer<typeof eligibilityRequestShema>) => {
  return [...patientBenefits] as Array<PatientBenefit>;
};
