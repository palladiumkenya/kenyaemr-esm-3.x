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
  billStatus: PaymentStatus.PENDING | '' | string = '',
  startingDate: Date = dayjs().startOf('day').toDate(),
  endDate: Date = dayjs().endOf('day').toDate(),
) => {
  const startingDateISO = startingDate.toISOString();
  const endDateISO = endDate.toISOString();

  const url = `${restBaseUrl}/cashier/bill?status=${billStatus}&v=custom:(uuid,display,voided,voidReason,adjustedBy,cashPoint:(uuid,name),cashier:(uuid,display),dateCreated,lineItems,patient:(uuid,display))&createdOnOrAfter=${startingDateISO}&createdOnOrBefore=${endDateISO}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: { results: Array<PatientInvoice> } }>(
    patientUuid ? `${url}&patientUuid=${patientUuid}` : url,
    openmrsFetch,
    {
      errorRetryCount: 2,
    },
  );

  const sortBills = sortBy(data?.data?.results ?? [], ['dateCreated']).reverse();
  const filteredBills = billStatus === '' ? sortBills : sortBills?.filter((bill) => bill?.status === billStatus);
  const filteredResults = filteredBills?.filter((res) => res.patient?.uuid === patientUuid);
  const formattedBills = isEmpty(patientUuid) ? filteredBills : filteredResults || [];

  return {
    bills: formattedBills,
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
  pendingBills: any[];
  pendingBillsCount: number;
  isLoadingBills: boolean;
  billsError: any;
  blockingMessage: string;
}
export const useBlockDischargeWithPendingBills = ({
  patientUuid,
}: UseBlockDischargeWithPendingBillsProps): UseBlockDischargeWithPendingBillsReturn => {
  const { bills, isLoading, error } = useBills(patientUuid, PaymentStatus.PENDING);

  const result = useMemo(() => {
    const pendingBills = bills?.filter((bill) => bill.status === PaymentStatus.PENDING) || [];
    const pendingBillsCount = pendingBills.length;
    const isDischargeBlocked = pendingBillsCount > 0;

    const blockingMessage = isDischargeBlocked
      ? `Sorry, Pending bills must be resolved before discharging a deceased patient.
`
      : '';
    return {
      isDischargeBlocked,
      pendingBills,
      pendingBillsCount,
      isLoadingBills: isLoading,
      billsError: error,
      blockingMessage,
    };
  }, [bills, isLoading, error]);

  return result;
};
