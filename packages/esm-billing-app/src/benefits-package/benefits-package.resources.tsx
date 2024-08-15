import { z } from 'zod';
import { Package } from '../types';

export const eligibilityRequestShema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  packageUUid: z.string().uuid(),
  diagnosisUuids: z.array(z.string().uuid()),
  isRefered: z.boolean(),
});

export const requestEligibility = async (data: z.infer<typeof eligibilityRequestShema>) => {
  return [] as Array<Package>;
};
