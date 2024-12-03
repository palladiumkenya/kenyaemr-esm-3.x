import { z } from 'zod';

export const visitAttributesFormSchema = z.object({
  isPatientExempted: z.string(),
  paymentMethods: z.string().optional(),
  insuranceScheme: z.string().optional(),
  policyNumber: z.string().optional(),
  exemptionCategory: z.string().optional(),
});

export type VisitAttributesFormValue = z.infer<typeof visitAttributesFormSchema>;
