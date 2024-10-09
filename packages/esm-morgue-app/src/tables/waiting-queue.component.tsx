import React from 'react';
import GenericTable from './generic-table.component';
import { ErrorState, formatDate } from '@openmrs/esm-framework';
import { toUpperCase } from '../helpers/expression-helper';
import { Tag, Button, DataTableSkeleton } from '@carbon/react';
import styles from './generic-table.scss';
import { useTranslation } from 'react-i18next';
import { useDeceasedPatient } from '../hook/useMorgue.resource';

export const WaitingQueue: React.FC = () => {
  const { data: deceasedPatients, error, isLoading } = useDeceasedPatient('Test');
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

  const actionColumn = () => (
    <Button kind="tertiary" className={styles.actionBtn}>
      {t('readyForAdmit', 'Ready for Admission')}
    </Button>
  );

  return <GenericTable rows={rows} headers={genericTableHeader} actionColumn={actionColumn} title={fromHospital} />;
};
