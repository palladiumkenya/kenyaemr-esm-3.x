import { z } from 'zod';

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
  manifestType: z.enum(['VL']),
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
