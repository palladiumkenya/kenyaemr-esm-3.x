import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';

export const pharmacyAssignmentFormSchema = z.object({
  entityIdentifier: z.string().min(1, 'Required'),
  entityType: z.enum(['org.openmrs.User', 'org.openmrs.Patient']),
  basisIdentifier: z.string().min(1, 'Required'),
  basisType: z.enum(['org.openmrs.Location']).optional().default('org.openmrs.Location'),
});

export async function fetchPerson(query: string, abortController: AbortController) {
  const patientsRes = await openmrsFetch(`${restBaseUrl}/patient?q=${query}`, {
    signal: abortController.signal,
  });
  return patientsRes.data.results;
}
export async function fetchUser(query: string, abortController: AbortController) {
  const customPresentation = 'custom:(uuid,display,person:(display))';
  const patientsRes = await openmrsFetch(`${restBaseUrl}/user?q=${query}&v=${customPresentation}`, {
    signal: abortController.signal,
  });
  return patientsRes.data.results;
}

export const saveMapping = async (data: z.infer<typeof pharmacyAssignmentFormSchema>) => {
  const url = `${restBaseUrl}/datafilter/entitybasismap`;
  const response = await openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    return await response.text();
  }
  throw new Error(`Error mapping patient`);
};

export const revokePharamacyAssignment = async (data: z.infer<typeof pharmacyAssignmentFormSchema>) => {
  const url = `${restBaseUrl}/datafilter/revoke`;
  const response = await openmrsFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    return await response.text();
  }
  throw new Error(`Error revoking mapping`);
};
