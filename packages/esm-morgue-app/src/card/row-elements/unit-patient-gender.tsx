import React from 'react';
import { useTranslation } from 'react-i18next';

const UnitPatientGender = ({ patient }) => {
  const { t } = useTranslation();
  const getGender = (gender: string): string => {
    switch (gender) {
      case 'M':
        return t('male', 'Male');
      case 'F':
        return t('female', 'Female');
      case 'O':
        return t('other', 'Other');
      case 'unknown':
        return t('unknown', 'Unknown');
      default:
        return gender;
    }
  };
  return <div>{getGender('F')}</div>;
};

export default UnitPatientGender;
