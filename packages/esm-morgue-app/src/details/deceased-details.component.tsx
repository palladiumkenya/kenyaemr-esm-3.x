import React from 'react';
import styles from './deceased-details.scss';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { getPatientUuidFromUrl } from '@openmrs/esm-patient-common-lib';

const DeceasedDetailsView: React.FC = () => {
  const patientUuid = getPatientUuidFromUrl();

  return (
    <div>
      {/* <ExtensionSlot name="patient-header-slot" state={{ patientUuid: patientUuid, deceasedPatie }} /> */}
      hellp
    </div>
  );
};

export default DeceasedDetailsView;
