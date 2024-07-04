import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';

export const pharmacyAssignmentFormSchema = z.object({
  entityIdentifier: z.string().min(1, 'Required'),
  entityType: z.enum(['org.openmrs.User', 'org.openmrs.Patient']),
  basisIdentifier: z.string().min(1, 'Required'),
  basisType: z.string().optional().default('org.openmrs.Location'),
});

export async function fetchPerson(query: string, abortController: AbortController) {
  const patientsRes = await openmrsFetch(`${restBaseUrl}/patient?q=${query}`, {
    signal: abortController.signal,
  });
  return patientsRes.data.results;
}
