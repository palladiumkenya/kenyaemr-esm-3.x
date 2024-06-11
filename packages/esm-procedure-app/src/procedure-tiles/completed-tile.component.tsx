import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tiles/summary-tile.component';
import { useProcedureOrderStats } from '../summary-tiles/procedure-summary.resource';

const CompletedTileComponent = () => {
  const { t } = useTranslation();

  const { count: completedCount } = useProcedureOrderStats('COMPLETED');

  return (
    <SummaryTile
      label={t('completed', 'Completed')}
      value={completedCount}
      headerLabel={t('proceduresCompleted', 'Completed')}
    />
  );
};

export default CompletedTileComponent;
