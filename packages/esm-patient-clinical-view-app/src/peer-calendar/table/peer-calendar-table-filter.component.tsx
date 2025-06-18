import { Dropdown } from '@carbon/react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type FilterStatus = 'completed' | 'pending' | 'all';

type PeerCalendarTableFilterProps = {
  filterStatus?: 'completed' | 'pending' | 'all';
  onUpdateFilterStatus: (status: FilterStatus) => void;
};

const PeerCalendarTableFilter: React.FC<PeerCalendarTableFilterProps> = ({
  onUpdateFilterStatus,
  filterStatus = 'pending',
}) => {
  const { t } = useTranslation();
  const statuses = useMemo(() => ['completed', 'pending', 'all'], []);
  const [_state, setSate] = useState<'completed' | 'pending' | 'all'>('completed');
  return (
    <div style={{ width: '200px' }}>
      <Dropdown
        titleText={t('filterByStatue', 'Filter by status')}
        id="filterByStatus"
        onChange={(e) => {
          onUpdateFilterStatus(e.selectedItem as FilterStatus);
        }}
        selectedItem={filterStatus}
        label={t('filterByStatus', 'Filter by status')}
        items={statuses}
        itemToString={(item) => item ?? ''}
      />
    </div>
  );
};

export default PeerCalendarTableFilter;
