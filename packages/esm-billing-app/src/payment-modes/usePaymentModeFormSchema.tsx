import { z } from 'zod';

const usePaymentModeFormSchema = () => {
  const attributeTypeSchema = z
    .object({
      name: z.string(),
      description: z.string(),
      retired: z.boolean().default(false),
      retiredReason: z.string().optional(),
      format: z.string().optional(),
      regExp: z.string().optional(),
      required: z.boolean().default(false),
    })
    .refine(
      (data) => {
        if (data.retired === true) {
          return !!data.retiredReason && data.retiredReason.trim().length > 0;
        }
        return true;
      },
      {
        message: 'Retired reason is required when attribute type is retired',
        path: ['retiredReason'],
      },
    );

  const paymentModeFormSchema = z.object({
    name: z
      .string({
        required_error: 'Payment mode name is required',
        invalid_type_error: 'Payment mode name is required',
      })
      .min(1, 'Payment mode name is required'),
    description: z
      .string({
        required_error: 'Payment mode description is required',
        invalid_type_error: 'Payment mode description is required',
      })
      .min(1, 'Payment mode description is required'),
    retired: z
      .boolean({
        invalid_type_error: 'Retired must be a boolean',
      })
      .optional()
      .default(false),
    attributeTypes: z.array(attributeTypeSchema).optional(),
  });

  return { paymentModeFormSchema };
};

export default usePaymentModeFormSchema;
