import { z } from 'zod';

export const visitAttributesFormSchema = z.object({
  isPatientExempted: z.string(),
  paymentMethods: z.string().optional(),
  insuranceScheme: z.string().optional(),
  policyNumber: z.string().optional(),
  exemptionCategory: z.string().optional(),
  packages: z.array(z.string()).nonempty('Require atleast 1 package'),
  interventions: z.array(z.string()).nonempty('Require atleast 1 intervention'),
});

export type VisitAttributesFormValue = z.infer<typeof visitAttributesFormSchema>;
