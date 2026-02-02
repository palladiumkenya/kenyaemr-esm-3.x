import React from 'react';
import { Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import type { Scheme } from '../hie.resource';
import styles from './patient-banner-sha-status.scss';
import { formatCoverageDate } from './helper';

interface SchemeTagProps {
  schemeInfo: { scheme: Scheme; eligible: boolean; memberType: string } | null;
  displayName: string;
}

const SchemeTag: React.FC<SchemeTagProps> = ({ schemeInfo, displayName }) => {
  const { t } = useTranslation();

  if (!schemeInfo || !schemeInfo.scheme) {
    return null;
  }

  const { scheme, eligible, memberType } = schemeInfo;
  const status = eligible ? t('eligible', 'Eligible') : t('notEligible', 'Not Eligible');
  const endDate = scheme.coverage?.endDate ? formatCoverageDate(scheme.coverage.endDate) : 'N/A';

  const tagText = `${displayName} | ${status} | ${endDate} | ${memberType}`;

  return (
    <Tag className={classNames(styles.tag, eligible ? styles.activeTag : styles.inactiveTag)} title={tagText}>
      {tagText}
    </Tag>
  );
};

export default SchemeTag;
