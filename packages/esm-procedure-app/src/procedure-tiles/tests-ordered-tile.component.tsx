import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tiles/summary-tile.component';
import { useProcedureOrderStats } from '../summary-tiles/procedure-summary.resource';

const OrderedTileComponent = () => {
  const { t } = useTranslation();

  const { count: testOrderedCount } = useProcedureOrderStats('');

  return (
    <SummaryTile
      label={t('orders', 'Orders')}
      value={testOrderedCount}
      headerLabel={t('proceduresOrdered', 'Active Orders')}
    />
  );
};

export default OrderedTileComponent;
