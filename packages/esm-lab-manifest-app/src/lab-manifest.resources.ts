import { generateOfflineUuid, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';
import { LabManifest, MappedLabManifest } from './types';

export const LabManifestFilters = [
  {
    label: 'Draft',
    value: 'Draft',
  },
  {
    label: 'Ready To send',
    value: 'Ready to send',
  },
  {
    label: 'On Hold',
    value: 'On Hold',
  },
  {
    label: 'Sending',
    value: 'Sending',
  },
  {
    label: 'Submitted',
    value: 'Submitted',
  },
  {
    label: 'Incomplete with Errors',
    value: 'Incomplete errors',
  },
  {
    label: 'Incomplete With Results',
    value: 'Incomplete results',
  },
  {
    label: 'Complete with Errors',
    value: 'Complete errors',
  },
  {
    label: 'Complete with Results',
    value: 'Complete results',
  },
];
const PHONE_NUMBER_REGEX = /^(\+?254|0)((7|1)\d{8})$/;

export const labManifestFormSchema = z.object({
  startDate: z.date({ coerce: true }),
  endDate: z.date({ coerce: true }),
  manifestType: z.number({ coerce: true }),
  dispatchDate: z.date({ coerce: true }),
  courierName: z.string().optional(),
  personHandedTo: z.string().optional(),
  county: z.string().optional(),
  subCounty: z.string().optional(),
  facilityEmail: z.string().email(),
  facilityPhoneContact: z.string().regex(PHONE_NUMBER_REGEX, { message: 'Invalid phone number' }),
  clinicianName: z.string(),
  clinicianContact: z.string().regex(PHONE_NUMBER_REGEX, { message: 'Invalid phone number' }),
  labPersonContact: z.string().regex(PHONE_NUMBER_REGEX, { message: 'Invalid phone number' }),
  manifestStatus: z.string(),
});

export const saveLabManifest = async (data: z.infer<typeof labManifestFormSchema>, manifestId: string | undefined) => {
  let url;
  const abortController = new AbortController();

  if (!manifestId) {
    url = `${restBaseUrl}/labmanifest`;
  } else {
    url = `${restBaseUrl}/labmanifest/${manifestId}`;
  }

  return openmrsFetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      startDate: data.startDate,
      endDate: data.endDate,
      dispatchDate: data.dispatchDate,
      courier: data.courierName,
      courierOfficer: data.personHandedTo,
      status: data.manifestStatus,
      county: data.county,
      subCounty: data.subCounty,
      facilityEmail: data.facilityEmail,
      facilityPhoneContact: data.facilityPhoneContact,
      clinicianPhoneContact: data.clinicianContact,
      clinicianName: data.clinicianName,
      labPocPhoneNumber: data.labPersonContact,
      manifestType: data.manifestType,
    }),
    signal: abortController.signal,
  });
};

export const extractLabManifest = (manifest: LabManifest) =>
  ({
    uuid: manifest.uuid,
    dispatchDate: manifest.dispatchDate,
    endDate: manifest.dispatchDate,
    startDate: manifest.startDate,
    clinicianContact: manifest.clinicianPhoneContact,
    clinicianName: manifest.clinicianName,
    county: manifest.county,
    courierName: manifest.courier,
    facilityEmail: manifest.facilityEmail,
    facilityPhoneContact: manifest.facilityPhoneContact,
    labPersonContact: manifest.labPocPhoneNumber,
    manifestId: manifest.identifier,
    manifestStatus: manifest.status,
    // manifestType: manifest.manifestType,
    personHandedTo: manifest.courierOfficer,
    subCounty: manifest.subCounty,
    samples: manifest.labManifestOrders ?? [],
  } as MappedLabManifest);
