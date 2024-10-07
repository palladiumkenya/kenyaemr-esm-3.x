import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';

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
