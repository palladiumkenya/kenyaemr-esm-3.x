import React from 'react';
import styles from './unit-patient-card.scss';
import { getPatientName, launchWorkspace } from '@openmrs/esm-framework';
import UnitPatientName from './row-elements/unit-patient-name';
import UnitPatientAge from './row-elements/unit-patient-age';
import UnitPatientGender from './row-elements/unit-patient-gender';
import UnitPatientObs from './row-elements/unit-patient-obs';
import UnitPatientUnitNumber from './row-elements/unit-patient-unit-number';
import UnitPatientIdentifier from './row-elements/unit-patient-identifier';
import unitPatientAddress from './row-elements/unit-patient-header-address';
import { DeceasedInfo } from '../tables/generic-table.resource';

interface WardPatientCardProps {
  patient: DeceasedInfo;
}
const WardPatientCard: React.FC<WardPatientCardProps> = ({ patient }) => {
  const patientCardRows = [
    UnitPatientName,
    UnitPatientAge,
    UnitPatientGender,
    unitPatientAddress,
    UnitPatientIdentifier,
    UnitPatientObs,
    UnitPatientUnitNumber,
  ];

  return (
    <div className={styles.wardPatientCard}>
      {patientCardRows.map((RowComponent, i) => (
        <div key={i} className={styles.wardPatientCardRow}>
          <RowComponent patient={patient} />
        </div>
      ))}
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace('ward-patient-workspace', {
            patientUuid: patient.uuid,
            ...patient,
          });
        }}>
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
