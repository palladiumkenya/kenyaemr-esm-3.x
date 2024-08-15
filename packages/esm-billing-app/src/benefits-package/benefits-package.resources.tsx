import { z } from 'zod';
import { PatientBenefit } from '../types';

export const eligibilityRequestShema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  packageUUid: z.string().uuid(),
  diagnosisUuids: z.array(z.string().uuid()),
  isRefered: z.boolean(),
});

export const requestEligibility = async (data: z.infer<typeof eligibilityRequestShema>) => {
  return [
    {
      shaPackageCode: 'SHA-001',
      shaPackageName: 'Eye Care',
      shaInterventionCode: 'SHA-001-01',
      shaInterventionName: '',
      shaInterventioTariff: 50000,
      requirePreauth: true,
      status: 'APPROVED',
    },
  ] as Array<PatientBenefit>;
};
