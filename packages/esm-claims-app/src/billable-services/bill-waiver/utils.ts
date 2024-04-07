import { OpenmrsResource } from '@openmrs/esm-framework';
import { LineItem, MappedBill } from '../../types';

export const createBillWaiverPayload = (
  bill: MappedBill,
  amountWaived: number,
  totalAmount: number,
  lineItems: Array<LineItem>,
  billableLineItems: Array<OpenmrsResource>,
  paymentModes: Array<OpenmrsResource>,
) => {
  const { cashier } = bill;

  const billPayment = {
    amount: parseFloat(totalAmount.toFixed(2)),
    amountTendered: parseFloat(Number(amountWaived).toFixed(2)),
    attributes: [],
    instanceType: paymentModes?.find((mode) => mode.name.toLowerCase().includes('waiver'))?.uuid,
  };

  const processedLineItems = lineItems.map((lineItem) => ({
    ...lineItem,
    billableService: processBillItem(lineItem),
    item: processBillItem(lineItem),
    paymentStatus: 'PAID',
  }));

  const processedPayment = {
    cashPoint: bill.cashPointUuid,
    cashier: cashier.uuid,
    lineItems: processedLineItems,
    payments: [...bill.payments, billPayment],
    patient: bill.patientUuid,
  };

  return processedPayment;
};

const processBillItem = (item) => (item.item || item.billableService)?.split(':')[0];
