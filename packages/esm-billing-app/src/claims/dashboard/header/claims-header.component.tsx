import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import isEqual from 'lodash-es/isEqual';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import ClaimMainComponent from '../../claims-wrap/claims-main-component';
import { MappedBill } from '../../../types';
import ClaimsPeriod from '../claims-period/period.component';
import { BillsProvider, useBillsContext } from '../claims-period/bills-context';
import { usePatientBillsByPeriod } from '../../../billing.resource';
import styles from './claims-header.scss';

interface ClaimsHeaderProps {
  patient: fhir.Patient;
  bill: MappedBill;
}

const ClaimsHeaderContent: React.FC<ClaimsHeaderProps> = ({ patient, bill }) => {
  const [searchParams] = useSearchParams();
  const claimUuid = searchParams.get('claimUuid');
  const { patient: currentPatient, isLoading: isLoadingPatient } = usePatient();
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null,
  });
  const { bills, setBills } = useBillsContext();
  const { bills: fetchedBills, isLoading } = usePatientBillsByPeriod(
    currentPatient?.id,
    dateRange.startDate,
    dateRange.endDate,
  );
  useEffect(() => {
    if (!isEqual(fetchedBills, bills)) {
      setBills(fetchedBills);
    }
  }, [fetchedBills, setBills, bills]);

  const handleSetDateRange = (startDate: string | null, endDate: string | null) => {
    setDateRange({ startDate, endDate });
  };
  return (
    <div className={styles.claimContainer}>
      {patient && <ExtensionSlot name="patient-header-slot" state={{ patientUuid: patient.id, patient }} />}
      <div className={styles.detailsContainer}>
        {claimUuid && <ClaimsPeriod onSetDateRange={handleSetDateRange} />}
        <ClaimMainComponent bill={bill} />
      </div>
    </div>
  );
};
const ClaimsHeader: React.FC<ClaimsHeaderProps> = (props) => {
  return (
    <BillsProvider>
      <ClaimsHeaderContent {...props} />
    </BillsProvider>
  );
};

export default ClaimsHeader;
