import React from 'react';
import { useTranslation } from 'react-i18next';
import { age } from '@openmrs/esm-framework';

const UnitPatientAge = () => {
  return <div>{age('12')}</div>;
};

export default UnitPatientAge;
