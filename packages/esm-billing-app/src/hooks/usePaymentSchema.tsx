import { z } from 'zod';
import { type MappedBill } from '../types';

export function usePaymentSchema(bill: MappedBill) {
  const paymentSchema = z
    .object({
      method: z
        .object({
          uuid: z.string(),
          name: z.string(),
          attributeTypes: z.array(
            z.object({
              uuid: z.string(),
              description: z.string(),
              required: z.boolean(),
            }),
          ),
        })
        .nullable()
        .refine((val) => val !== null, { message: 'Payment method is required' }),
      amount: z.number().refine((value) => {
        const amountDue = Number(bill.totalAmount) - (Number(bill.tenderedAmount) + Number(value));
        return amountDue >= 0 && value > 0;
      }, 'Amount paid should not be greater than amount due'),
      referenceCode: z.string(),
    })
    .refine(
      (data) => {
        const hasRequiredAttribute = data.method?.attributeTypes.some((attr) => attr.required === true);
        if (hasRequiredAttribute) {
          return data.referenceCode.trim().length > 0;
        }
        return true;
      },
      {
        message: 'Reference code is required for this payment method',
        path: ['referenceCode'],
      },
    );

  return paymentSchema;
}
