import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type BillDeposit, type CreateDepositPayload } from '../types/bill-deposit.types';
import { CUSTOM_REPRESENTATION } from '../constants/bill-deposit.constants';
import { saveDeposit, deleteDeposit } from '../utils/bill-deposit.utils';

export const useBillDeposit = (patientUuid: string) => {
  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Array<BillDeposit> } }>(
    patientUuid
      ? `${restBaseUrl}/cashier/deposit?patient=${patientUuid}&includeAll=false&v=${CUSTOM_REPRESENTATION}`
      : null,
    openmrsFetch,
  );

  const deposits = data?.data.results ?? [];

  const createDeposit = async (deposit: CreateDepositPayload) => {
    const response = await saveDeposit(deposit);
    await mutate();
    return response;
  };

  const updateDeposit = async (deposit: Partial<BillDeposit>, uuid: string) => {
    const response = await saveDeposit(deposit, uuid);
    await mutate();
    return response;
  };

  const removeDeposit = async (uuid: string) => {
    const response = await deleteDeposit(uuid);
    await mutate();
    return response;
  };

  return {
    deposits,
    isLoading,
    error,
    createDeposit,
    updateDeposit,
    removeDeposit,
  };
};
