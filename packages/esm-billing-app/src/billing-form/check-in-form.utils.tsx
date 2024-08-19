import { z } from 'zod';

export type VisitAttributesFormValue = {
  isPatientExempted: string;
  paymentMethods: { uuid: string; name: string } | null;
  insuranceScheme: string;
  policyNumber: string;
  exemptionCategory: string;
};

export const visitAttributesFormSchema = z.object({
  isPatientExempted: z.string(),
  paymentMethods: z.object({ uuid: z.string(), name: z.string() }).nullable(),
  insuranceScheme: z.string().optional(),
  policyNumber: z.string().optional(),
  exemptionCategory: z.string().optional(),
});
