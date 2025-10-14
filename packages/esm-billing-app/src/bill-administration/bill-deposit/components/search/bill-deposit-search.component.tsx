import React, { useState, useEffect } from 'react';
import { formatDate, launchWorkspace, parseDate } from '@openmrs/esm-framework';
import { useBillDeposit } from '../../hooks/useBillDeposit';
import { Button, InlineLoading } from '@carbon/react';
import styles from './bill-deposit-search.scss';
import { useTranslation } from 'react-i18next';
import { Add } from '@carbon/react/icons';
import PatientSearch from './components/patient-search';
import PatientInfo from './components/patient-info';
import DepositTable from './components/deposit-table';
import EmptyPatientBill from '../../../../past-patient-bills/patient-bills-dashboard/empty-patient-bill.component';

const BillDepositSearch: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPatientUuid, setSelectedPatientUuid] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const { deposits, isLoading } = useBillDeposit(selectedPatientUuid);

  useEffect(() => {
    if (selectedPatientUuid) {
      setIsInitialLoad(true);
    }
  }, [selectedPatientUuid]);

  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad]);

  const formattedDeposits = deposits.map((deposit) => ({
    id: deposit.uuid,
    depositType: deposit.depositType,
    amount: deposit.amount,
    status: deposit.status,
    dateCreated: formatDate(parseDate(deposit.dateCreated)),
    referenceNumber: deposit.referenceNumber,
    availableBalance: deposit.availableBalance,
    patient: deposit.patient,
    description: deposit.description,
    transactions: deposit.transactions,
  }));

  const handleLaunchDepositForm = () => {
    launchWorkspace('add-deposit-workspace', {
      patientUuid: selectedPatientUuid,
    });
  };

  const handlePatientSelect = (uuid: string) => {
    setSelectedPatientUuid(uuid);
  };

  const renderContent = () => {
    if (!selectedPatientUuid) {
      return <EmptyPatientBill />;
    }

    if (isInitialLoad) {
      return (
        <div className={styles.initialLoadingContainer}>
          <InlineLoading description={t('loading', 'Loading...')} />
        </div>
      );
    }

    return (
      <>
        <div className={styles.depositResultsHeader}>
          <PatientInfo patientUuid={selectedPatientUuid} />
          <div className={styles.actions}>
            <Button renderIcon={Add} kind="ghost" onClick={handleLaunchDepositForm}>
              {t('newDeposit', 'New Deposit')}
            </Button>
          </div>
        </div>
        {deposits.length === 0 ? (
          <EmptyPatientBill
            launchForm={handleLaunchDepositForm}
            buttonText={t('newDeposit', 'New Deposit')}
            title={t('noDepositsFound', 'No deposits found')}
            subTitle={t('createNewDeposit', 'Create a new deposit for this patient')}
          />
        ) : (
          <DepositTable deposits={formattedDeposits} />
        )}
      </>
    );
  };

  return (
    <div className={styles.billDepositSearchContainer}>
      <PatientSearch onPatientSelect={handlePatientSelect} />
      <div className={styles.searchResultsContainer}>
        {renderContent()}
        {isLoading && !isInitialLoad && (
          <div className={styles.loadingOverlay}>
            <InlineLoading description={t('loading', 'Loading...')} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BillDepositSearch;
