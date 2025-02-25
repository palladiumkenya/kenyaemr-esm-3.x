import { DataTableSkeleton } from '@carbon/react';
import { ConfigurableLink, ErrorState, formatDate, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './generic-table.scss';
import GenericTable from './generic-table.component';
import { ConfigObject } from '../config-schema';
import usePatients from '../hook/useDischargedPatient';

interface DischargedProps {
  dischargedPatientUuids: string[];
  isLoading: boolean;
  error: any;
}

export const DischargedBodies: React.FC<DischargedProps> = ({ isLoading, error, dischargedPatientUuids }) => {
  const { t } = useTranslation();
  const dischargedInLine = t('dischargeBodies', 'Discharged bodies');
  const patientChartUrl = '${openmrsSpaBase}/patient/${patientUuid}/chart/deceased-panel';
  const { patients, isLoading: isLoadingPatients, error: patientsError } = usePatients(dischargedPatientUuids);

  const { nextOfKinAddressUuid, nextOfKinNameUuid, nextOfKinPhoneUuid, nextOfKinRelationshipUuid } =
    useConfig<ConfigObject>();

  const genericTableHeader = [
    { header: 'Patient Name', key: 'name' },
    { header: 'Gender', key: 'gender' },
    { header: 'Identifier', key: 'identifier' },
    { header: 'Age', key: 'age' },
    { header: 'Date of Death', key: 'deathDate' },
    { header: 'Cause of Death', key: 'causeOfDeath' },
  ];

  if (isLoading) {
    return (
      <div className={styles.table}>
        <DataTableSkeleton
          headers={genericTableHeader}
          aria-label="discharged-datatable"
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
    return <ErrorState error={error} headerTitle={t('dischargeBodies', 'Discharged bodies')} />;
  }

  const getAttributeValue = (patient, uuid) => {
    return patient?.person?.attributes?.find((attr) => attr?.attributeType?.uuid === uuid)?.value || '--';
  };

  const rows = patients?.map((patient) => {
    const openmrsID = patient?.identifiers?.find((id) => id.display.startsWith('OpenMRS ID'))?.display.split(' = ')[1];

    const nextOfKin = {
      name: getAttributeValue(patient, nextOfKinNameUuid),
      phone: getAttributeValue(patient, nextOfKinPhoneUuid),
      address: getAttributeValue(patient, nextOfKinAddressUuid),
      relationship: getAttributeValue(patient, nextOfKinRelationshipUuid),
    };

    return {
      id: patient?.uuid,
      name: (
        <ConfigurableLink
          style={{ textDecoration: 'none', maxWidth: '50%' }}
          to={patientChartUrl}
          templateParams={{ patientUuid: patient?.uuid }}>
          {patient?.person?.display?.toUpperCase()}
        </ConfigurableLink>
      ),
      gender: patient?.person?.gender || '--',
      age: patient?.person?.age || '--',
      identifier: openmrsID || '--',
      deathDate: formatDate(new Date(patient?.person?.deathDate)) || '--',
      causeOfDeath: patient?.person?.causeOfDeath?.display || '--',
      nextOfKin: nextOfKin, // Ensure nextOfKin is included in the row
    };
  });
  return <GenericTable rows={rows} headers={genericTableHeader} title={dischargedInLine} />;
};
