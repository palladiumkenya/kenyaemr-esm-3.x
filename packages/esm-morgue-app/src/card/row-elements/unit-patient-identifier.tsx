import React from 'react';
import { Tag } from '@carbon/react';
import { translateFrom, type PatientIdentifier } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const UnitPatientIdentifier = () => {
  const { t } = useTranslation();
  return (
    <div>
      <Tag>{t('identifierTypelabel', '{{label}}:', { label: 'MGHAKY' })}</Tag> : <></>
      <span>{'MHGHKY'}</span>
    </div>
  );
};
export default UnitPatientIdentifier;
