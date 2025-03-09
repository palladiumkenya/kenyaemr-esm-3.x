import { Dropdown } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './surveillance.scss';

const SurveillanceFilters = () => {
  const { t } = useTranslation();
  const reportingPeriods = [{ label: 'Last 1 week view' }];
  return (
    <div className={styles.filtersContainer}>
      <Dropdown
        className={styles.viewToggler}
        autoAlign
        id="filters"
        itemToString={(item) => item?.label ?? ''}
        items={reportingPeriods}
        selectedItem={reportingPeriods[0]}
        label={t('reportingPeriod', 'Reporting Period')}
      />
    </div>
  );
};

export default SurveillanceFilters;
