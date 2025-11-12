import { DismissibleTag, Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QueueFilter } from '../../types';
import styles from './queue-filters.scss';
type FiltersHeaderProps = {
  filters?: Array<QueueFilter>;
  onFiltersChanged?: (filters: Array<QueueFilter>) => void;
};
const FiltersHeader: React.FC<FiltersHeaderProps> = ({ filters = [], onFiltersChanged }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <strong>{t('filters', 'Filters')}:</strong>
      {filters.map((filter) => (
        <DismissibleTag
          key={filter.key}
          onClose={() => onFiltersChanged?.(filters.filter((f) => f.key !== filter.key))}
          text={filter.label}
          type="green"
        />
      ))}
      {filters.length === 0 && <Tag>{t('noFilters', 'No filters')}</Tag>}
      {filters.length > 0 && (
        <DismissibleTag text={t('clearFilters', 'Clear filters')} onClose={() => onFiltersChanged?.([])} type="red" />
      )}
    </div>
  );
};

export default FiltersHeader;
