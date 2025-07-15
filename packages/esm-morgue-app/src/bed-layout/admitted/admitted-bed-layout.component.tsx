import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import styles from '../bed-layout.scss';
import BedCard from '../../bed/bed.component';
import { type MortuaryLocationResponse } from '../../typess';
import EmptyBedCard from '../../bed/empty-bed.component';
import Divider from '../../bed/divider/divider.component';

interface BedLayoutProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
}

const BedLayout: React.FC<BedLayoutProps> = ({ AdmittedDeceasedPatient, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  const bedLayouts = AdmittedDeceasedPatient?.bedLayouts || [];

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.bedLayoutContainer}>
        {bedLayouts.map((bedLayout, index) => {
          const patients = bedLayout.patients || [];
          const isEmpty = bedLayout.status === 'AVAILABLE' || patients.length === 0;

          if (isEmpty) {
            return (
              <EmptyBedCard
                key={bedLayout.bedUuid || `empty-bed-${bedLayout.bedId}-${index}`}
                bedNumber={bedLayout.bedNumber}
                bedType={bedLayout.bedType?.displayName}
              />
            );
          }

          return (
            <div
              key={bedLayout.bedUuid}
              className={`${styles.bedContainer} ${patients.length > 1 ? styles.sharedBedContainer : ''}`}>
              {patients.length > 1 ? (
                <div className={styles.horizontalLayout}>
                  {patients.map((patient, patientIndex) => (
                    <React.Fragment key={patient.uuid}>
                      <BedCard
                        patientUuid={patient.uuid}
                        patientName={patient.person?.display}
                        gender={patient.person?.gender}
                        age={patient.person?.age}
                        causeOfDeath={patient.person?.causeOfDeath?.display}
                        dateOfDeath={patient.person?.deathDate}
                        bedNumber={bedLayout.bedNumber}
                        bedType={bedLayout.bedType?.displayName}
                      />
                      {patientIndex < patients.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <BedCard
                  patientUuid={patients[0].uuid}
                  patientName={patients[0].person?.display}
                  gender={patients[0].person?.gender}
                  age={patients[0].person?.age}
                  causeOfDeath={patients[0].person?.causeOfDeath?.display}
                  dateOfDeath={patients[0].person?.deathDate}
                  bedNumber={bedLayout.bedNumber}
                  bedType={bedLayout.bedType?.displayName}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BedLayout;
