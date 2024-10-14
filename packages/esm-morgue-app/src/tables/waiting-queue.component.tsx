import React from 'react';
import GenericTable from './generic-table.component';
import { ErrorState, formatDate, launchWorkspace } from '@openmrs/esm-framework';
import { toUpperCase } from '../helpers/expression-helper';
import { Tag, Button, DataTableSkeleton } from '@carbon/react';
import styles from './generic-table.scss';
import { useTranslation } from 'react-i18next';
import { useDeceasedPatient } from '../hook/useMorgue.resource';

export const WaitingQueue: React.FC = () => {
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient();
  const { t } = useTranslation();
  const fromHospital = t('fromHosp', 'From Hospital');

  const genericTableHeader = [
    { header: 'S/No', key: 'serialNumber' },
    { header: 'Deceased Name', key: 'name' },
    { header: 'ID No ', key: 'Ids' },
    { header: 'Gender', key: 'gender' },
    { header: 'Dob', key: 'birthdate' },
    { header: 'Date of Death', key: 'deathDate' },
    { header: 'Cause of Death', key: 'causeOfDeath' },
    { header: 'Status Death', key: 'status' },
    { header: 'Residence', key: 'address4' },
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

  const rows =
    deceasedPatients?.map((patient, index) => ({
      id: patient.uuid,
      serialNumber: index + 1,
      name: toUpperCase(patient.person.display),
      gender: patient.person.gender,
      birthdate: formatDate(new Date(patient.person.birthdate)),
      deathDate: formatDate(new Date(patient.person.deathDate)),
      causeOfDeath: patient.person.causeOfDeath?.display || 'N/A',
      status: <Tag type="green">{patient.person.dead ? 'Known' : 'Unknown'}</Tag>,
      Ids: patient.identifiers[0]?.identifier || 'N/A',
      address4: patient.person.preferredAddress?.address4 || 'N/A',
    })) || [];
  const handleAdmissionForm = () => {
    launchWorkspace('patient-additional-info-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
    });
  };
  const actionColumn = () => (
    <Button kind="tertiary" className={styles.actionBtn} onClick={handleAdmissionForm}>
      {t('admit', 'Admit')}
    </Button>
  );

  return <GenericTable rows={rows} headers={genericTableHeader} actionColumn={actionColumn} title={fromHospital} />;
};
