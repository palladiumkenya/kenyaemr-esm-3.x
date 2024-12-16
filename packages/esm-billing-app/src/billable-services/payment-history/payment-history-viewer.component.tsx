import { DataTableSkeleton } from '@carbon/react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import EmptyPatientBill from '../../past-patient-bills/patient-bills-dashboard/empty-patient-bill.component';
import { PaymentHistoryTable } from './payment-history-table.component';
import { usePaymentFilterContext } from './usePaymentFilterContext';
import { usePaymentTransactionHistory } from './usePaymentTransactionHistory';

export const PaymentHistoryViewer = () => {
  const { t } = useTranslation();
  const { filters } = usePaymentFilterContext();
  const { bills: filteredBills, isLoading } = usePaymentTransactionHistory(filters);

  const headers = useMemo(
    () => [
      { header: t('billDate', 'Date'), key: 'dateCreated' },
      { header: t('patientName', 'Patient Name'), key: 'patientName' },
      { header: t('identifier', 'Identifier'), key: 'identifier' },
      { header: t('totalAmount', 'Total Amount'), key: 'totalAmount' },
      { header: t('billingService', 'Service'), key: 'billingService' },
      { header: t('referenceCodes', ' Reference Codes'), key: 'referenceCodes' },
      { header: t('status', 'Status'), key: 'status' },
    ],
    [t],
  );
  return (
    <>
      {isLoading ? (
        <DataTableSkeleton headers={headers} aria-label={t('transactionHistory', 'Transaction History')} />
      ) : filteredBills.length > 0 ? (
        <PaymentHistoryTable headers={headers} rows={filteredBills} />
      ) : (
        <EmptyPatientBill
          title={t('noTransactionHistory', 'No transaction history')}
          subTitle={t('noTransactionHistorySubtitle', 'No transaction history loaded for the selected filters')}
        />
      )}
    </>
  );
};
