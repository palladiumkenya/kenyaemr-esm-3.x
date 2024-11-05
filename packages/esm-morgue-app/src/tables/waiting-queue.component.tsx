import React from 'react';
import GenericTable from './generic-table.component';
import { ErrorState, formatDate, launchWorkspace } from '@openmrs/esm-framework';
import { toUpperCase } from '../helpers/expression-helper';
import { Tag, Button, DataTableSkeleton, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import styles from './generic-table.scss';
import { useTranslation } from 'react-i18next';
import { useDeceasedPatient, useVisitType } from '../hook/useMorgue.resource';
import { formatToReadableDate } from '../utils/utils';

export const WaitingQueue: React.FC = () => {
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient();
  const { t } = useTranslation();
  const fromHospital = t('waitingInLine', 'Waiting In Line');

  const genericTableHeader = [
    { header: 'Patient Name', key: 'name' },
    { header: 'Gender', key: 'gender' },
    { header: 'Identifier ', key: 'Ids' },
    { header: 'Age', key: 'age' },
    { header: 'Date of Death', key: 'deathDate' },
    { header: 'Cause of Death', key: 'causeOfDeath' },
    ,
  ];

  if (isLoading) {
    return (
      <div className={styles.table}>
        <DataTableSkeleton
          headers={genericTableHeader}
          aria-label="awaiting-datatable"
          showToolbar={false}
          showHeader={false}
          rowCount={10}
          zebra
          columnCount={9}
        />
      </div>
    );
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('waitingQueue', 'Waiting queue')} />;
  }

  const rows = deceasedPatients?.map((patient, index) => ({
    id: patient.uuid,
    name: toUpperCase(patient.person.display),
    gender: patient.person.gender,
    age: patient?.person?.age,
    Ids: patient?.identifiers[0]?.identifier,
    deathDate: formatToReadableDate(patient.person.deathDate),
    causeOfDeath: patient.person.causeOfDeath?.display,
  }));
  const handleAdmissionForm = (patientUuid: string) => {
    launchWorkspace('patient-additional-info-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patientUuid,
    });
  };
  const actionColumn = (row) => (
    <div className={styles.groupButtons}>
      <Button kind="primary" className={styles.actionBtn} size="sm" onClick={() => handleAdmissionForm(row.id)}>
        {t('admit', 'Admit')}
      </Button>
      <Button kind="tertiary" className={styles.actionBtn} size="sm">
        {t('release', 'Release')}
      </Button>
    </div>
  );

  return <GenericTable rows={rows} headers={genericTableHeader} actionColumn={actionColumn} title={fromHospital} />;
};
