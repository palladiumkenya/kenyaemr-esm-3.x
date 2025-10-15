import { useMemo } from 'react';
import useSWR from 'swr';

import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { createPartographyEncounter } from '../partography.resource';
import { useTranslation } from 'react-i18next';
import { DRUG_ORDER_TYPE_UUID } from '../../../config-schema';

export async function saveDrugOrderData(
  patientUuid: string,
  formData: {
    drugName: string;
    dosage: string;
    route: string;
    frequency: string;
  },
  t: (key: string, defaultValue?: string) => string,
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await createPartographyEncounter(patientUuid, 'drugs-fluids', formData);
    return result;
  } catch (error) {
    return {
      success: false,
      message: error?.message || t('Failed to save drug order data'),
    };
  }
}

export function useDrugOrders(patientUuid: string) {
  const { t } = useTranslation();
  const apiUrl = patientUuid
    ? `${restBaseUrl}/order?patient=${patientUuid}&orderType=${DRUG_ORDER_TYPE_UUID}&v=full&limit=50`
    : null;

  const { data, error, isLoading, mutate } = useSWR(apiUrl, openmrsFetch);

  const drugOrders = useMemo(() => {
    const responseData = data?.data as any;

    if (!responseData?.results || !Array.isArray(responseData.results)) {
      return [];
    }

    const allOrders = responseData.results;
    const activeOrders = allOrders
      .filter((order: any) => order.action === 'NEW' && !order.dateStopped)
      .sort((a: any, b: any) => {
        const dateA = a.dateActivated ? new Date(a.dateActivated).getTime() : 0;
        const dateB = b.dateActivated ? new Date(b.dateActivated).getTime() : 0;
        return dateB - dateA;
      });

    const processedOrders = activeOrders.map((order: any) => {
      const processed = {
        id: order.uuid,
        drugName: order.drug?.display || order.drugNonCoded || t('Unknown Drug'),
        dosage: `${order.dose || ''} ${order.doseUnits?.display || ''}`.trim(),
        route: order.route?.display || '',
        frequency: order.frequency?.display || '',
        date: order.dateActivated ? new Date(order.dateActivated).toLocaleDateString() : '',
        orderNumber: order.orderNumber,
        display: order.display,
        quantity: order.quantity,
        duration: order.duration,
        durationUnits: order.durationUnits?.display,
        asNeeded: order.asNeeded,
        instructions: order.instructions,
        orderer: order.orderer?.display,
      };
      return processed;
    });

    return processedOrders;
  }, [data, t]);

  let localizedError = error;
  if (error) {
    localizedError = t('Failed to load drug orders');
  }

  return {
    drugOrders,
    isLoading,
    error: localizedError,
    mutate,
  };
}
