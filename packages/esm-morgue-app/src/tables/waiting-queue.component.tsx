import React from 'react';
import GenericTable from './generic-table.component';
import { ErrorState, formatDate, launchWorkspace } from '@openmrs/esm-framework';
import { toUpperCase } from '../helpers/expression-helper';
import { Tag, Button, DataTableSkeleton, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import styles from './generic-table.scss';
import { useTranslation } from 'react-i18next';
import { useDeceasedPatient } from '../hook/useMorgue.resource';
import { formatDateTime } from '../utils/utils';

interface WaitingQueueProps {
  isLoading: boolean;
  deceasedPatients: any;
  error: any;
}

export const WaitingQueue: React.FC<WaitingQueueProps> = ({ isLoading, deceasedPatients, error }) => {
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

  const rows = awaitingPatients.map((patient, index) => {
    const openMrsId =
      patient?.patient?.identifiers
        ?.find((id) => id.display.startsWith('OpenMRS ID'))
        ?.display.split('=')[1]
        ?.trim() || t('missingIdentifier', '--');

    return {
      id: `${patient?.patient?.uuid}`,
      name: toUpperCase(patient?.person?.person?.display || t('unknownName', '--')),
      gender: patient?.person?.person?.gender || t('unknownGender', '--'),
      age: patient?.person?.person?.age || t('unknownAge', '--'),
      identifier: openMrsId,
      deathDate: formatDateTime(patient?.person?.person?.deathDate) || t('nullDate', '--'),
      causeOfDeath: patient?.person?.person?.causeOfDeath?.display || t('unknownCause', '--'),
      status: <Tag type="magenta">{patient?.status || t('unknownStatus', '--')}</Tag>,
    };
  });

  const handleAdmissionForm = (patientUuid: string) => {
    launchWorkspace('patient-additional-info-form', {
      workspaceTitle: t('admissionForm', 'Admission form'),
      patientUuid,
    });
  };

  const actionColumn = (row) => {
    return (
      <OverflowMenu size="sm" flipped>
        <OverflowMenuItem itemText={t('admit', 'Admit')} onClick={() => handleAdmissionForm(row.id)} />
      </OverflowMenu>
    );
  };

  return <GenericTable rows={rows} headers={genericTableHeader} actionColumn={actionColumn} title={waitingInLine} />;
};
