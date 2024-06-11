import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LaboratoryActiveTestOrderResults from './procedure-active-order/procedure-active-order-results.component';
import LaboratoryPastTestOrderResults from './procedure-past-test/laboratory-past-test-order-results.component';

interface PatientLaboratoryResultsProps {
  patientUuid: string;
}

const PatientLaboratoryResults: React.FC<PatientLaboratoryResultsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const [hasActiveOrderResults, setHasActiveOrderResults] = useState<boolean | null>(null);

  return (
    <>
      <div style={{ margin: '10px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <LaboratoryActiveTestOrderResults patientUuid={patientUuid} />
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <LaboratoryPastTestOrderResults patientUuid={patientUuid} />
        </div>
      </div>
    </>
  );
};

export default PatientLaboratoryResults;
