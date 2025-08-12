import { z } from 'zod';

export const facilityReferralSchema = z.object({
  referralType: z.string().min(1, 'Referral type is required'),
  patientUuid: z.string().min(1, 'Patient selection is required'),
  selectedFacility: z
    .object({
      uuid: z.string(),
      name: z.string(),
      attributes: z.array(z.any()),
    })
    .nullable()
    .refine((facility) => facility !== null, {
      message: 'Destination facility is required',
    }),
  selectedReasons: z
    .array(
      z.object({
        uuid: z.string(),
        name: z.object({
          name: z.string(),
        }),
      }),
    )
    .min(1, 'At least one referral reason is required'),
  clinicalNotes: z.string().min(10, 'Clinical notes must be at least 10 characters long'),
});

export type FacilityReferralFormData = z.infer<typeof facilityReferralSchema>;
export type ValidationErrors = Partial<Record<keyof FacilityReferralFormData, string>>;
