import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
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

export function getAllMonthsInYear(monthFormart = 'MMMM'): { index: number; name: string }[] {
  const months = [];
  for (let month = 1; month <= 12; month++) {
    const formattedMonth = dayjs(new Date(new Date().getFullYear(), month - 1)).format(monthFormart);
    months.push({ index: month, name: formattedMonth });
  }
  return months;
}

export function getFirstAndLastDayOfMonth(month: number, year: number): { firstDay: Date; lastDay: Date } {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  return { firstDay, lastDay };
}

export function getYearsAroundCurrentYear(yearsToInclude: number = 10): number[] {
  const currentYear = dayjs().year();
  const years: number[] = [];

  for (let i = currentYear - yearsToInclude; i <= currentYear + yearsToInclude; i++) {
    years.push(i);
  }

  return years;
}
