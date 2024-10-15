import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { boolean, z } from 'zod';
import { Patient, Peer, ReportingPeriod } from '../types';

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

const isPatientEnrolledToProgram = async (patientUuid: string, programUuid: string): Promise<boolean> => {
  const customRep = 'custom:(uuid,program:(name,uuid))';
  const url = `${restBaseUrl}/programenrollment?patient=${patientUuid}&v=${customRep}`;
  const resp = await openmrsFetch<{ results: Array<{ uuid: string; program: { name: string; uuid: string } }> }>(url);
  return (resp.data?.results ?? [])?.findIndex((en) => en.program.uuid === programUuid) !== -1;
};

export async function fetchPerson(query: string, abortController: AbortController, kvpProgramUuid: string) {
  const patientsRes = await openmrsFetch<{ results: Array<Patient> }>(`${restBaseUrl}/patient?q=${query}`, {
    signal: abortController.signal,
  });

  const patients = [];
  for (const patient of patientsRes.data.results ?? []) {
    if (await isPatientEnrolledToProgram(patient.uuid, kvpProgramUuid)) {
      patients.push(patient);
    }
  }

  return patients;
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

export const filterActivePeersWithDate = (peer: Peer, reportingPeriod: Partial<ReportingPeriod>): boolean => {
  // If peer has no startDate, return false (invalid peer)
  if (!peer.startDate) {
    return false;
  }

  // Convert peer startDate and endDate to Date objects
  const startDate = new Date(peer.startDate);
  const endDate = peer.endDate ? new Date(peer.endDate) : undefined;

  // Get current date if reporting period is incomplete
  const timeStamp = new Date();
  const { firstDay, lastDay } = getFirstAndLastDayOfMonth(
    reportingPeriod?.month ?? timeStamp.getMonth() + 1, // Default to current month
    reportingPeriod?.year ?? timeStamp.getFullYear(), // Default to current year
  );

  // Case 1: Peer has no end date, meaning they're still active
  if (!endDate) {
    return dayjs(startDate).isBefore(lastDay); // Peer started before the end of the reporting period
  }

  // Case 2: Peer has both start and end dates, check if within the reporting period
  return (
    dayjs(startDate).isBefore(lastDay) && // Peer started before the end of the reporting period
    dayjs(endDate).isAfter(firstDay) // Peer has not expired before the start of the reporting period
  );
};
