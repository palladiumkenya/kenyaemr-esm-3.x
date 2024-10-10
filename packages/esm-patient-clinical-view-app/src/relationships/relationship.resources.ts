import { openmrsFetch, restBaseUrl, showModal, showSnackbar } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { z } from 'zod';
import { Patient } from '../types';

export const relationshipUpdateFormSchema = z
  .object({
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

export const updateRelationship = (relationshipUuid: string, payload: z.infer<typeof relationshipUpdateFormSchema>) => {
  const url = `${restBaseUrl}/relationship/${relationshipUuid}`;
  return openmrsFetch(url, {
    body: JSON.stringify(payload),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const deleteRelationship = async (relationshipUuid: string) => {
  const dispose = showModal('relationship-delete-confirm-dialog', {
    onClose: () => dispose(),
    onDelete: async () => {
      try {
        const url = `${restBaseUrl}/relationship/${relationshipUuid}`;
        await openmrsFetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/relationship`));
        dispose();
        showSnackbar({ title: 'Success', kind: 'success', subtitle: 'Relationship deleted successfully!' });
      } catch (e) {
        showSnackbar({ title: 'Failure', kind: 'error', subtitle: 'Error deleting relationship' });
      }
    },
  });
};

export async function fetchPerson(query: string, abortController: AbortController) {
  const patientsRes = await openmrsFetch<{ results: Array<Patient> }>(`${restBaseUrl}/patient?q=${query}`, {
    signal: abortController.signal,
  });
  return patientsRes?.data?.results ?? [];
}
