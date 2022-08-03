import React from 'react';
import { InlineLoading, Tag } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { usePatientFlags } from '../hooks/usePatientFlags';

interface PatientFlagsProps {
  patientUuid: string;
}

const PatientFlags: React.FC<PatientFlagsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { patientFlags, isLoading, error } = usePatientFlags(patientUuid);

  if (isLoading) {
    return <InlineLoading description={t('loading', 'Loading...')} />;
  }

  if (error) {
    return <span>{t('errorPatientFlags', 'Patient flags error')}</span>;
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
