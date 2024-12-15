import { filterBills } from './bill-filter';
import { Filter, MappedBill } from '../../../types';

describe('Bill Filter', () => {
  const mockBills: Array<MappedBill> = [
    {
      uuid: '1',
      payments: [
        { instanceType: { name: 'Cash' }, amount: 100 },
        { instanceType: { name: 'MPESA' }, amount: 200 },
      ],
      lineItems: [{ serviceTypeUuid: 'service-1' }, { serviceTypeUuid: 'service-2' }],
      status: 'PAID',
      cashier: { uuid: 'cashier-1' },
    },
    {
      uuid: '2',
      payments: [{ instanceType: { name: 'Cash' }, amount: 300 }],
      lineItems: [{ serviceTypeUuid: 'service-3' }],
      status: 'PENDING',
      cashier: { uuid: 'cashier-2' },
    },
  ] as Array<MappedBill>;

  it('should return all bills when no filters are applied', () => {
    const filters: Filter = {};
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(2);
    expect(result).toEqual(mockBills);
  });

  it('should filter bills by payment method', () => {
    const filters: Filter = {
      paymentMethods: ['MPESA'],
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(1);
    expect(result[0].payments).toHaveLength(1);
    expect(result[0].payments[0].instanceType.name).toBe('MPESA');
  });

  it('should filter bills by multiple payment methods', () => {
    const filters: Filter = {
      paymentMethods: ['Cash', 'MPESA'],
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(2);
  });

  it('should filter bills by service type', () => {
    const filters: Filter = {
      serviceTypes: ['service-1'],
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toBe('1');
  });

  it('should filter bills by cashier', () => {
    const filters: Filter = {
      cashiers: ['cashier-1'],
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(1);
    expect(result[0].cashier.uuid).toBe('cashier-1');
  });

  it('should filter bills by status', () => {
    const filters: Filter = {
      status: 'PENDING',
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('PENDING');
  });

  it('should combine multiple filters', () => {
    const filters: Filter = {
      paymentMethods: ['Cash'],
      serviceTypes: ['service-1'],
      cashiers: ['cashier-1'],
      status: 'PAID',
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(1);
    expect(result[0].uuid).toBe('1');
  });

  it('should return empty array when no bills match filters', () => {
    const filters: Filter = {
      paymentMethods: ['NonExistentMethod'],
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(0);
  });

  it('should handle case-insensitive payment method matching', () => {
    const filters: Filter = {
      paymentMethods: ['cash', 'mpesa'], // lowercase
    };
    const result = filterBills(mockBills, filters);
    expect(result).toHaveLength(2);
  });

  it('should filter out bills with no payments when payment methods are specified', () => {
    const billsWithEmptyPayments = [
      ...mockBills,
      {
        uuid: '3',
        payments: [],
        lineItems: [],
        status: 'PENDING',
        cashier: { uuid: 'cashier-3' },
      } as MappedBill,
    ];

    const filters: Filter = {
      paymentMethods: ['Cash'],
    };
    const result = filterBills(billsWithEmptyPayments, filters);
    expect(result).toHaveLength(2);
    expect(result.find((bill) => bill.uuid === '3')).toBeUndefined();
  });
});
