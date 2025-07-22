import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export const createPaymentSchema = (t: (key: string, defaultValue?: string) => string, billBalance: number) =>
  z
    .object({
      instanceType: z
        .object({
          uuid: z.string().min(1, t('instanceTypeUuidRequired', 'Instance type UUID is required')),
          name: z.string().min(1, t('instanceTypeNameRequired', 'Instance type name is required')),
          description: z.string().optional(),
          retired: z.boolean().optional(),
          retireReason: z.string().nullable().optional(),
          attributeTypes: z
            .array(
              z.object({
                uuid: z.string().optional(),
                name: z.string().optional(),
                description: z.string().optional(),
                required: z.boolean().optional(),
              }),
            )
            .optional(),
          sortOrder: z.number().nullable().optional(),
          resourceVersion: z.string().optional(),
        })
        .optional(),
      amountTendered: z
        .number()
        .positive(t('amountTenderedPositive', 'Amount tendered must be positive'))
        .max(billBalance, t('amountTenderedExceedsBalance', 'Amount tendered cannot exceed bill balance')),
      attributes: z.record(z.string(), z.string()).optional(),
    })
    .refine(
      (data) => {
        // Check if all required attributes have values
        if (!data.instanceType?.attributeTypes) {
          return true;
        }

        const requiredAttributeTypes = data.instanceType.attributeTypes.filter((attr) => attr.required && attr.uuid);
        const providedAttributes = data.attributes || {};

        for (const requiredAttr of requiredAttributeTypes) {
          if (!providedAttributes[requiredAttr.uuid] || providedAttributes[requiredAttr.uuid].trim() === '') {
            return false;
          }
        }

        return true;
      },
      {
        message: t('requiredAttributesMissing', 'Required attributes are missing'),
        path: ['attributes'],
      },
    );

export const usePaymentForm = (t: (key: string, defaultValue?: string) => string, billBalance: number) => {
  const paymentSchema = createPaymentSchema(t, billBalance);

  type PaymentFormData = z.infer<typeof paymentSchema>;

  const formMethods = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      instanceType: undefined,
      amountTendered: undefined,
      attributes: {},
    },
  });

  return {
    formMethods,
    paymentSchema,
  };
};
