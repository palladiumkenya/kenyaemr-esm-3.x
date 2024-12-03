import { openmrsFetch, Visit } from '@openmrs/esm-framework';
import { z } from 'zod';

export const eligibilityRequestShema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  diagnosisUuids: z.array(z.string()),
  packageUUid: z.string(),
  interventions: z.array(z.string()),
  isRefered: z.boolean(),
});

export const preauthSchema = z.object({
  patientUuid: z.string().uuid(),
  providerUuid: z.string().uuid(),
  facilityUuid: z.string().uuid(),
  diagnosisUuids: z.array(z.string()),
  packageUUid: z.string(),
  interventions: z.array(z.string()).nonempty('Require atleast 1 intervention'),
});

export const preAuthenticateBenefit = async (
  data: z.infer<typeof preauthSchema>,
  visit: Visit,
  mflCodeValue: string,
) => {
  const payload = {
    claimExplanation: 'This is the claim explanation',
    claimJustification: 'This is the claim justification',
    startDate: visit.startDatetime,
    endDate: new Date().toISOString(),
    diagnoses: data.diagnosisUuids,
    interventions: data.interventions,
    paidInFacility: true,
    patient: data.patientUuid,
    visitType: visit.visitType.uuid,
    provider: data.providerUuid,
    providedItems: {},
    location: mflCodeValue,
    guaranteeId: '',
    claimCode: 'C123456',
    use: 'preauthorization',
    insurer: 'SHA',
    billNumber: '',
    encounterUuid: visit?.encounters[0]?.uuid,
    visitUuid: visit.uuid,
  };

  const url = `/ws/rest/v1/insuranceclaims/claims`;
  return openmrsFetch(url, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
