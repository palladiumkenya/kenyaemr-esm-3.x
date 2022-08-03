import React from 'react';
import { InlineLoading, Tag } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { usePatientFlags } from '../hooks/usePatientFlags';

interface PatientFlagsProps {
  patientUuid: string;
}

const PatientFlags: React.FC<PatientFlagsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patientFlags, error } = usePatientFlags(patientUuid);

  if (error) {
    return <span>{t('errorPatientFlags', 'Error loading patient flags')}</span>;
  }

  return (
    <>
      {patientFlags.map((patientFlag) => (
        <Tag key={patientFlag} type="magenta">
          {patientFlag}
        </Tag>
      ))}
    </>
  );
};

export default PatientFlags;
