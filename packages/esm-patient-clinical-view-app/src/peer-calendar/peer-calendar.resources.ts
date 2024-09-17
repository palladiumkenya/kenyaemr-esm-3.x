import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';

export const peerFormSchema = z
  .object({
    personB: z.string().uuid(),
    personA: z.string().uuid(),
    startDate: z.date({ coerce: true }).max(new Date(), 'Can not be a furture date'),
    endDate: z.date({ coerce: true }).optional(),
    relationshipType: z.string().uuid(),
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['endDate'] },
  );

export async function fetchPerson(query: string, abortController: AbortController) {
  const patientsRes = await openmrsFetch(`${restBaseUrl}/patient?q=${query}`, {
    signal: abortController.signal,
  });
  return patientsRes.data.results;
}

export const createRelationship = (payload: z.infer<typeof peerFormSchema>) => {
  return openmrsFetch(`${restBaseUrl}/relationship`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
