import React, { useMemo } from 'react';
import styles from './patient-summary.scss';
import {
  ErrorState,
  ExtensionSlot,
  fetchCurrentPatient,
  useLayoutType,
  WorkspaceContainer,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { InlineLoading } from '@carbon/react';
import { useInitialize } from '../patient-search/useInitialize';
import PatientEncounter from '../encounters/patient-encounter.component';
import useSWR from 'swr';

const AdrPatientSummary: React.FC = () => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const isTablet = layout === 'tablet';
  const { patientUuid } = useParams<{ patientUuid: string }>();
  const {
    data: patient,
    isLoading,
    error,
  } = useSWR(patientUuid ? ['patient', patientUuid] : null, () => fetchCurrentPatient(patientUuid!, {}));

  const state = useMemo(() => ({ patient, patientUuid }), [patient, patientUuid]);

  useInitialize(patientUuid, state);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading description={t('loading', 'Loading...')} />
      </div>
    );
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('error', 'Error')} />;
  }

  return (
    <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
      {patient && patientUuid && <ExtensionSlot name="patient-header-slot" state={{ patient, patientUuid }} />}
      <div className={styles.patientEncounterContainer}>
        <PatientEncounter patientUuid={patientUuid} />
      </div>
      <WorkspaceContainer
        showSiderailAndBottomNav
        key="adr-assessment"
        contextKey={`adr-assessment/overview/${patientUuid}`}
        additionalWorkspaceProps={state}
      />
    </div>
  );
};

export default AdrPatientSummary;
