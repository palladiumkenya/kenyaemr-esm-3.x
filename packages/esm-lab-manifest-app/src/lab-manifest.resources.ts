import { generateOfflineUuid, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { z } from 'zod';
import { labManifest } from './lab-manifest.mock';

export const LabManifestFilters = [
  {
    label: 'Draft',
    value: 'draft',
  },
  {
    label: 'Ready To send',
    value: 'readyToSend',
  },
  {
    label: 'On Hold',
    value: 'onHold',
  },
  {
    label: 'Sending',
    value: 'sending',
  },
  {
    label: 'Submitted',
    value: 'submitted',
  },
  {
    label: 'Incomplete with Errors',
    value: 'incompleteWithErrors',
  },
  {
    label: 'Incomplete With Results',
    value: 'incompleteWithResults',
  },
  {
    label: 'Complete with Errors',
    value: 'completeWithErrors',
  },
  {
    label: 'Complete with Results',
    value: 'completeWithResults',
  },
];
const PHONE_NUMBER_REGEX = /^(\+?254|0)((7|1)\d{8})$/;

export const labManifestFormSchema = z.object({
  startDate: z.date({ coerce: true }),
  endDate: z.date({ coerce: true }),
  manifestType: z.string(),
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

export const manifestTypes = [
  {
    value: 'VL',
    label: 'Viral load',
  },
];

export const saveLabManifest = async (data: z.infer<typeof labManifestFormSchema>, maifestId: string | undefined) => {
  await new Promise((res, _) => {
    setTimeout(res, 300);
  });
  const abortController = new AbortController();
  const { dispatchDate, endDate, startDate } = data;
  // return openmrsFetch(`${restBaseUrl}/labManifests`, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   method: 'POST',
  //   body: JSON.stringify(data),
  //   signal: abortController.signal,
  // });
  if (!maifestId) {
    labManifest.push({
      ...data,
      dispatchDate: dispatchDate.toISOString(),
      endDate: endDate.toISOString(),
      startDate: startDate.toISOString(),
      uuid: generateOfflineUuid(),
    });
  } else {
    const index = labManifest.findIndex((mn) => mn.uuid === maifestId);
    labManifest[index] = {
      ...data,
      dispatchDate: dispatchDate.toISOString(),
      endDate: endDate.toISOString(),
      startDate: startDate.toISOString(),
      uuid: generateOfflineUuid(),
    };
  }
};
