import React from 'react';
import lowerCase from 'lodash-es/lowerCase';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';

type PillProps = {
  value?: string;
  className: string;
  dataAttrName: string;
};

export const PriorityPill: React.FC<PillProps> = ({ value, className, dataAttrName }) => {
  const { t } = useTranslation();
  if (!value) {
    return <React.Fragment>--</React.Fragment>;
  }
  return (
    <div className={className} data-priority={dataAttrName === 'priority' ? lowerCase(value) : undefined}>
      {t(value, capitalize(value.replace('_', ' ')))}
    </div>
  );
};

export const StatusPill: React.FC<PillProps> = ({ value, className, dataAttrName }) => {
  const { t } = useTranslation();
  if (!value) {
    return <React.Fragment>--</React.Fragment>;
  }
  return (
    <div className={className} data-status={dataAttrName === 'status' ? lowerCase(value) : undefined}>
      {t(value, capitalize(value.replace('_', ' ')))}
    </div>
  );
};
