import { Dropdown } from '@carbon/react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type PeerCalendarTableFilterProps = {
  filterStatus?: 'completed' | 'pending' | 'all';
  onUpdateFilterStatus: (status: 'completed' | 'pending' | 'all') => void;
};

const PeerCalendarTableFilter: React.FC<PeerCalendarTableFilterProps> = ({
  onUpdateFilterStatus,
  filterStatus = 'pending',
}) => {
  const { t } = useTranslation();
  const statuses = useMemo(() => ['completed', 'pending', 'all'], []);
  const [_state, _setState] = useState<'completed' | 'pending' | 'all'>('completed');
  return (
    <div style={{ width: '200px' }}>
      <Dropdown
        id="filterByStatus"
        onChange={(e) => {
          onUpdateFilterStatus(e.selectedItem);
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
