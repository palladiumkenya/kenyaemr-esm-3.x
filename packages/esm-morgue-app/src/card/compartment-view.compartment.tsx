import React from 'react';
import styles from './compartment.scss';
import EmptyCompartment from './empty-compartment.component';
import AvailableCompartment from './avail-compartment.compartment';
import EmptyDeceasedSearch from '../empty-state/empty-morgue-admission.component';
import { useTranslation } from 'react-i18next';
import { useAdmissionLocation } from '../hook/useMortuaryAdmissionLocation';
import { InlineLoading } from '@carbon/react';
import CompartmentShareDivider from './compartmentSharing.component';

const CompartmentView: React.FC = () => {
  const { t } = useTranslation();
  const { admissionLocation, isLoading } = useAdmissionLocation();

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription="Loading"
        description={t('pullingCompartment', 'Pulling compartments data...')}
      />
    );
  }

  return admissionLocation?.bedLayouts?.length > 0 ? (
    <div className={styles.allPatientCardWrapper}>
      {admissionLocation?.bedLayouts?.map((bed, index) => (
        <div key={bed.bedUuid} className={styles.cardRow}>
          {bed.status === 'OCCUPIED' ? (
            <>
              {bed.patients.length > 1 ? (
                <div className={styles.verticalLayout}>
                  {bed.patients.map((patient, patientIndex) => (
                    <React.Fragment key={patient.uuid}>
                      <AvailableCompartment patientInfo={patient} bedNumber={bed?.bedNumber} />
                      {patientIndex < bed.patients.length - 1 && <CompartmentShareDivider />}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className={styles.horizontalLayout}>
                  <AvailableCompartment patientInfo={bed.patients[0]} bedNumber={bed?.bedNumber} />
                </div>
              )}
            </>
          ) : (
            <EmptyCompartment bedNumber={bed?.bedNumber} />
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className={styles.emptyStateContainer}>
      <EmptyDeceasedSearch
        title={t('noResultNotFound', 'No result found')}
        subTitle={t('adjustFilterOrSwitch', 'Try adjusting your search.')}
      />
    </div>
  );
};

export default CompartmentView;
