import { z } from 'zod';

const ServiceConceptSchema = z.object({
  concept: z.object({
    uuid: z.string(),
    display: z.string(),
  }),
  conceptName: z.object({
    uuid: z.string(),
    display: z.string(),
  }),
  display: z.string(),
});

export const servicePriceSchema = z.object({
  price: z.number().gt(0.01, 'Price must be greater than 0').min(0.01, 'Price must be at least 0.01'),
  paymentMode: z.object({ uuid: z.string(), name: z.string() }),
});

export const billableFormSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  shortName: z
    .string()
    .refine((value) => value.length !== 1, { message: 'Short name must be at least 1 character long' }),
  serviceType: z.object({ uuid: z.string(), display: z.string() }),
  servicePrices: z.array(servicePriceSchema).min(1, 'At least one price is required'),
  serviceStatus: z.enum(['ENABLED', 'DISABLED']),
  concept: ServiceConceptSchema,
  stockItem: z.string().optional(),
});

export type BillableFormSchema = z.infer<typeof billableFormSchema>;
export type ServicePriceSchema = z.infer<typeof servicePriceSchema>;
