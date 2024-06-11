import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@openmrs/esm-framework';
import { LaboratoryOrderFilter, usePatientLaboratoryOrders } from './patient-procedure-order-results.resource';

export function useLaboratoryOrderResultsPages(filter: LaboratoryOrderFilter) {
  const { t } = useTranslation();

  const pageSizes = [10, 20, 30, 40, 50];
  const [currentPageSize, setPageSize] = useState(10);

  const { items, isLoading, isError } = usePatientLaboratoryOrders(filter);
  const { goTo, results: paginatedItems, currentPage } = usePagination(items, currentPageSize);

  const tableHeaders = useMemo(
    () => [
      {
        id: 0,
        header: t('orderDate', 'Test Date'),
        key: 'orderDate',
      },
      { id: 1, header: t('tests', 'Tests'), key: 'orders' },
      { id: 2, header: t('location', 'Location'), key: 'location' },
      { id: 3, header: t('status', 'Status'), key: 'status' },
      { id: 4, header: t('actions', 'Action'), key: 'actions' },
    ],
    [t],
  );

  return {
    items: paginatedItems,
    totalItems: items?.length,
    currentPage,
    currentPageSize,
    paginatedItems,
    goTo,
    pageSizes,
    isLoading,
    isError,
    setPageSize,
    tableHeaders,
  };
}
