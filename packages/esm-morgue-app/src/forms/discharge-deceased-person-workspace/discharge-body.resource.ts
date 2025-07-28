import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Patient, PatientInfo, PatientInvoice, PaymentStatus } from '../../types';
import dayjs from 'dayjs';
import sortBy from 'lodash-es/sortBy';
import { useMemo } from 'react';

export const usePersonAttributes = (personUuid: string) => {
  const { data, error, isLoading } = useSWR<FetchResponse<{ results: Patient['person']['attributes'] }>>(
    personUuid ? `${restBaseUrl}/person/${personUuid}/attribute` : null,
    openmrsFetch,
  );

  const updatePersonAttributes = async (
    payload: { attributeType: string; value: string },
    personUuid: string,
    attributeUuid: string,
  ) => {
    const url = `${restBaseUrl}/person/${personUuid}/attribute/${attributeUuid}`;
    return openmrsFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const createPersonAttribute = async (payload: { attributeType: string; value: string }, personUuid: string) => {
    const url = `${restBaseUrl}/person/${personUuid}/attribute`;
    return openmrsFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const createOrUpdatePersonAttribute = async (
    personUuid: string,
    payload: { attributeType: string; value: string },
    person: PatientInfo,
  ) => {
    const { attributeType, value } = payload;

    const existingAttribute = person.attributes.find((attr) => attr.attributeType?.uuid === attributeType);

    try {
      if (existingAttribute) {
        return await updatePersonAttributes({ attributeType, value }, personUuid, existingAttribute.uuid);
      } else {
        return await createPersonAttribute({ attributeType, value }, personUuid);
      }
    } catch (error) {
      console.error('Error creating/updating person attribute:', error);

      if (error?.responseBody?.error?.message?.includes('already in use')) {
        throw new Error(
          `The identifier "${value}" is already in use by another patient. Please use a different identifier.`,
        );
      }

      throw error;
    }
  };

  return {
    personAttributes: data?.data?.results ?? [],
    error,
    isLoading,
    updatePersonAttributes,
    createPersonAttribute,
    createOrUpdatePersonAttribute,
  };
};
export const useBills = (
  patientUuid: string = '',
  billStatus: PaymentStatus | '' | string = '',
  startingDate: Date = dayjs().startOf('day').toDate(),
  endDate: Date = dayjs().endOf('day').toDate(),
) => {
  const startingDateISO = startingDate.toISOString();
  const endDateISO = endDate.toISOString();

  let url = `${restBaseUrl}/cashier/bill?v=custom:(uuid,display,voided,voidReason,adjustedBy,cashPoint:(uuid,name),cashier:(uuid,display),dateCreated,lineItems,patient:(uuid,display),status,balance,totalPayments,totalExempted,totalDeposits,closed)&createdOnOrAfter=${startingDateISO}&createdOnOrBefore=${endDateISO}`;

  if (patientUuid) {
    url += `&patientUuid=${patientUuid}`;
  }

  if (billStatus) {
    url += `&status=${billStatus}`;
  }

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    url,
    openmrsFetch,
    {
      errorRetryCount: 2,
    },
  );

  const results = data?.data?.results ?? [];

  const sortedBills = sortBy(results, ['dateCreated']).reverse();

  const patientFilteredBills = patientUuid
    ? sortedBills.filter((bill) => bill.patient?.uuid === patientUuid)
    : sortedBills;

  const statusFilteredBills = billStatus
    ? patientFilteredBills.filter((bill) => bill.status === billStatus)
    : patientFilteredBills;

  return {
    bills: statusFilteredBills,
    error,
    isLoading,
    isValidating,
    mutate,
  };
};

interface UseBlockDischargeWithPendingBillsProps {
  patientUuid: string;
  actionType: 'discharge' | 'dispose';
}

interface UseBlockDischargeWithPendingBillsReturn {
  isDischargeBlocked: boolean;
  pendingBills: PatientInvoice[];
  pendingBillsCount: number;
  isLoadingBills: boolean;
  billsError: any;
  blockingMessage: string;
}

export const useBlockDischargeWithPendingBills = ({
  patientUuid,
  actionType,
}: UseBlockDischargeWithPendingBillsProps): UseBlockDischargeWithPendingBillsReturn => {
  const { bills, isLoading, isValidating, error } = useBills(patientUuid, '');

  const result = useMemo(() => {
    if (isLoading || isValidating) {
      return {
        isDischargeBlocked: false,
        pendingBills: [],
        pendingBillsCount: 0,
        isLoadingBills: true,
        billsError: error,
        blockingMessage: '',
      };
    }

    if (error) {
      console.error('Error fetching bills:', error);
      return {
        isDischargeBlocked: false,
        pendingBills: [],
        pendingBillsCount: 0,
        isLoadingBills: false,
        billsError: error,
        blockingMessage: '',
      };
    }

    const pendingBills =
      bills?.filter((bill) => {
        const isPending = bill.status === PaymentStatus.PENDING;
        const isNotVoided = !bill.voided;

        let hasBalance = false;
        if (bill.balance !== undefined) {
          hasBalance = bill.balance > 0;
        } else {
          const totalAmount =
            bill.lineItems?.reduce((sum, item) => {
              return sum + (item as any).price * (item as any).quantity;
            }, 0) || 0;

          const totalPayments =
            bill.totalPayments || bill.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

          const totalExempted = bill.totalExempted || 0;
          const totalDeposits = bill.totalDeposits || 0;

          const outstandingBalance = totalAmount - totalPayments - totalExempted - totalDeposits;
          hasBalance = outstandingBalance > 0;
        }

        const isNotClosed = bill.closed !== undefined ? !bill.closed : true;

        return isPending && hasBalance && isNotVoided && isNotClosed;
      }) || [];

    const pendingBillsCount = pendingBills.length;
    const isDischargeBlocked = pendingBillsCount > 0;

    const totalOutstandingBalance = pendingBills.reduce((acc, bill) => {
      if (bill.balance !== undefined) {
        return acc + bill.balance;
      } else {
        const totalAmount =
          bill.lineItems?.reduce((sum, item) => {
            return sum + (item as any).price * (item as any).quantity;
          }, 0) || 0;

        const totalPayments =
          bill.totalPayments || bill.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

        const totalExempted = bill.totalExempted || 0;
        const totalDeposits = bill.totalDeposits || 0;

        const outstandingBalance = totalAmount - totalPayments - totalExempted - totalDeposits;
        return acc + Math.max(0, outstandingBalance);
      }
    }, 0);

    const blockingMessage = isDischargeBlocked
      ? `The deceased patient cannot be ${actionType}d due to ${pendingBillsCount} unpaid ${
          pendingBillsCount === 1 ? 'bill' : 'bills'
        } (Total balance: Ksh.${totalOutstandingBalance.toLocaleString()}). Please visit the cashier to settle all outstanding bills before ${actionType}.`
      : '';
    return {
      isDischargeBlocked,
      pendingBills,
      pendingBillsCount,
      isLoadingBills: false,
      billsError: error,
      blockingMessage,
    };
  }, [bills, isLoading, isValidating, error, actionType]);

  return result;
};
