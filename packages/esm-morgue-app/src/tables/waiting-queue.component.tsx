import React from 'react';
import GenericTable from './generic-table.component';
import { ErrorState, formatDate, launchWorkspace } from '@openmrs/esm-framework';
import { toUpperCase } from '../helpers/expression-helper';
import { Tag, Button, DataTableSkeleton, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import styles from './generic-table.scss';
import { useTranslation } from 'react-i18next';
import { useDeceasedPatient } from '../hook/useMorgue.resource';

export const WaitingQueue: React.FC = () => {
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient();
  const { t } = useTranslation();
  const waitingInLine = t('waitingInLine', 'Waiting In Line');

  const genericTableHeader = [
    { header: 'Patient Name', key: 'name' },
    { header: 'Gender', key: 'gender' },
    { header: 'Identifier', key: 'identifier' },
    { header: 'Age', key: 'age' },
    { header: 'Date of Death', key: 'deathDate' },
    { header: 'Cause of Death', key: 'causeOfDeath' },
    { header: 'Status', key: 'status' },
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
          columnCount={7}
        />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('waitingQueue', 'Waiting queue')} />;
  }

  const awaitingPatients = deceasedPatients?.filter((patient) => patient?.status === 'awaiting') || [];

  const rows = awaitingPatients.map((patient) => ({
    id: patient.uuid,
    name: toUpperCase(patient.person.display),
    gender: patient.person.gender,
    age: patient?.person?.age,
    identifier: patient?.identifiers[0]?.identifier,
    deathDate: formatDate(new Date(patient.person.deathDate)),
    causeOfDeath: patient.person.causeOfDeath?.display,
    status: <Tag type="magenta">{patient.status}</Tag>,
  }));

  const handleAdmissionForm = (patientUuid: string) => {
    launchWorkspace('patient-additional-info-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patientUuid,
    });
  };

  const handleDischargeForm = (patientUuid: string) => {
    launchWorkspace('discharge-body-form', {
      workspaceTitle: t('dischargeForm', 'Discharge form'),
      patientUuid,
    });
  };

  const actionColumn = (row) => (
    <OverflowMenu size="sm" flipped>
      <OverflowMenuItem itemText={t('admit', 'Admit')} onClick={() => handleAdmissionForm(row.id)} />
      <OverflowMenuItem isDelete itemText={t('release', 'Release')} onClick={() => handleDischargeForm(row.id)} />
    </OverflowMenu>
  );

  return <GenericTable rows={rows} headers={genericTableHeader} actionColumn={actionColumn} title={waitingInLine} />;
};
