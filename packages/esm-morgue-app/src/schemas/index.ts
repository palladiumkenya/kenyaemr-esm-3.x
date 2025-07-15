import { z } from 'zod';

export const deceasedPatientAdmitSchema = z.object({
  dateOfAdmission: z
    .date({ coerce: true })
    .refine((date) => !!date, 'Date of admission is required')
    .refine((date) => date <= new Date(), 'Date of admission cannot be in the future'),
  timeOfDeath: z.string().nonempty('Time of death is required'),
  period: z
    .string()
    .nonempty('AM/PM is required')
    .regex(/^(AM|PM)$/i, 'Invalid period'),
  tagNumber: z.string().nonempty('Tag number is required'),
  obNumber: z.string().optional(),
  policeName: z.string().optional(),
  policeIDNo: z.string().optional(),
  dischargeArea: z.string().optional(),
  visitType: z.string().uuid('invalid visit type'),
  availableCompartment: z
    .union([z.number(), z.string()])
    .refine((val) => {
      if (typeof val === 'string') {
        return val.length > 0 && !isNaN(Number(val)) && Number(val) > 0;
      }
      return typeof val === 'number' && !isNaN(val) && val > 0;
    }, 'Please select a valid compartment')
    .transform((val) => (typeof val === 'string' ? Number(val) : val)),
  services: z.array(z.string().uuid('invalid service')).nonempty('Must select one service'),
  paymentMethod: z.string().uuid('invalid payment method'),
  insuranceScheme: z.string().optional(),
  policyNumber: z.string().optional(),
});
export const dischargeSchema = z.object({
  dateOfDischarge: z.date({ coerce: true }).refine((date) => !!date, 'Date of discharge is required'),
  timeOfDischarge: z.string().nonempty('Time of discharge is required'),
  period: z
    .string()
    .nonempty('AM/PM is required')
    .regex(/^(AM|PM)$/i, 'Invalid period'),
  burialPermitNumber: z.string().nonempty('Burial Permit Number is required'),
  nextOfKinNames: z.string().nonempty('Next of kin names is required'),
  relationshipType: z.string().nonempty('Next of kin relationship is required'),
  nextOfKinAddress: z.string().nonempty('Next of kin address is required'),
  nextOfKinContact: z
    .string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .nonempty('Next of kin phone number is required'),
});
