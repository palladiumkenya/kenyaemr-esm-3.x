import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton, InlineLoading, Pagination } from '@carbon/react';
import { launchWorkspace, useConfig } from '@openmrs/esm-framework';
import styles from '../bed-layout.scss';
import { type MortuaryLocationResponse } from '../../types';
import { ConfigObject } from '../../config-schema';
import { mutate as mutateSWR } from 'swr';
import usePatients, { useMortuaryDischargeEncounter } from './discharged-bed-layout.resource';
import BedCard from '../../bed/bed.component';
import EmptyMorgueAdmission from '../../empty-state/empty-morgue-admission.component';

interface BedLayoutProps {
  AdmittedDeceasedPatient: MortuaryLocationResponse | null;
  isLoading: boolean;
  onPrintGatePass?: (patientUuid: string) => void;
  onPrintPostmortem?: (patientUuid: string) => void;
  mutate?: () => void;
}

const DischargedBedLayout: React.FC<BedLayoutProps> = ({
  AdmittedDeceasedPatient,
  isLoading,
  onPrintGatePass,
  onPrintPostmortem,
  mutate,
}) => {
  const { t } = useTranslation();
  const { morgueDischargeEncounterTypeUuid } = useConfig<ConfigObject>();

  const {
    dischargedPatientUuids,
    isLoading: encountersLoading,
    error: encountersError,
    currentPage,
    totalCount,
    currPageSize,
    setCurrPageSize,
    goTo,
  } = useMortuaryDischargeEncounter(morgueDischargeEncounterTypeUuid, AdmittedDeceasedPatient);

  const {
    patients: dischargedPatients,
    isLoading: patientsLoading,
    error: patientsError,
  } = usePatients(dischargedPatientUuids || []);

  const handlePrintGatePass = (patientUuid: string) => {
    if (onPrintGatePass) {
      onPrintGatePass(patientUuid);
    }
  };

  const handlePrintPostmortem = (patientUuid: string) => {
    if (onPrintPostmortem) {
      onPrintPostmortem(patientUuid);
    }
  };

  if (isLoading || encountersLoading || patientsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loadingPatients', 'Loading patients...')} />
      </div>
    );
  }

  if (encountersError || patientsError) {
    return (
      <div className={styles.emptyState}>
        <p>{t('errorLoadingPatients', 'Error loading discharged patients')}</p>
      </div>
    );
  }

  if (!dischargedPatients || dischargedPatients.length === 0) {
    return (
      <EmptyMorgueAdmission
        title={t('noDischargedPatient', 'No deceased patients currently discharged')}
        subTitle={t(
          'noDischargedPatientsDescription',
          'There are no discharged deceased patients to display at this time.',
        )}
      />
    );
  }

  return (
    <div className={styles.bedLayoutWrapper}>
      <div className={styles.bedLayoutContainer}>
        {dischargedPatients.map((patient) => {
          const patientUuid = patient?.uuid;
          const patientName = patient?.person?.display;
          const gender = patient?.person?.gender;
          const age = patient?.person?.age;
          const causeOfDeath = patient?.person?.causeOfDeath?.display;
          const dateOfDeath = patient?.person?.deathDate;

          return (
            <BedCard
              key={patientUuid}
              patientName={patientName}
              gender={gender}
              age={age}
              causeOfDeath={causeOfDeath}
              dateOfDeath={dateOfDeath}
              patientUuid={patientUuid}
              onPrintGatePass={() => handlePrintGatePass(patientUuid)}
              onPrintPostmortem={() => handlePrintPostmortem(patientUuid)}
              isDischarged={true}
            />
          );
        })}
      </div>

      <div className={styles.paginationFooter}>
        <Pagination
          page={currentPage || 1}
          totalItems={totalCount || 0}
          pageSize={currPageSize}
          pageSizes={[10, 20, 50, 100]}
          onChange={({ page, pageSize }: { page: number; pageSize: number }) => {
            if (pageSize !== currPageSize) {
              setCurrPageSize(pageSize);
              goTo(1);
            } else {
              goTo(page);
            }
          }}
        />
      </div>
    </div>
  );
};

export default DischargedBedLayout;
