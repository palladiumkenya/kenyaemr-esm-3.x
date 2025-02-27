import { Dropdown } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './surveillance.scss';

const SurveillanceFilters = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.filtersContainer}>
      <Dropdown
        className={styles.viewToggler}
        autoAlign
        id="filters"
        itemToString={(item) => item?.label ?? ''}
        items={[{ label: 'Last day view' }, { label: 'Last 1 week view' }]}
        label={t('toggleView', 'Toggle View')}
      />
    </div>
  );
};

export default SurveillanceFilters;
