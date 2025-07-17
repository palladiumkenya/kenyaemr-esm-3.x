import { FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { Patient, PatientInfo, PatientInvoice, PaymentStatus } from '../../types';
import dayjs from 'dayjs';
import sortBy from 'lodash-es/sortBy';
import isEmpty from 'lodash-es/isEmpty';
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

    const existingAttribute = person.attributes.find((attr) => attr.uuid === attributeType);

    if (existingAttribute) {
      return updatePersonAttributes(
        { attributeType: existingAttribute.uuid, value },
        personUuid,
        existingAttribute.uuid,
      );
    } else {
      return createPersonAttribute({ attributeType, value }, personUuid);
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
        const hasBalance = bill.balance && bill.balance > 0;
        const isNotVoided = !bill.voided;
        const isNotClosed = !bill.closed;

        return isPending && hasBalance && isNotVoided && isNotClosed;
      }) || [];

    const pendingBillsCount = pendingBills.length;
    const isDischargeBlocked = pendingBillsCount > 0;

    const blockingMessage = isDischargeBlocked
      ? `Sorry, ${pendingBillsCount} pending bill(s) with outstanding balance of Ksh.${pendingBills.reduce(
          (acc, curr) => acc + curr.balance,
          0,
        )} must be settled before discharging a deceased patient.`
      : '';

    return {
      isDischargeBlocked,
      pendingBills,
      pendingBillsCount,
      isLoadingBills: false,
      billsError: error,
      blockingMessage,
    };
  }, [bills, isLoading, isValidating, error]);

  return result;
};
