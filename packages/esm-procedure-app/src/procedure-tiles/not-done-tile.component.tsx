import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tiles/summary-tile.component';
import { useProcedureOrderStats } from '../summary-tiles/procedure-summary.resource';

const NotDoneTileComponent = () => {
  const { t } = useTranslation();

  const { count: declinedCount } = useProcedureOrderStats('DECLINED');

  return <SummaryTile label={t('notDone', 'Not Done')} value={declinedCount} headerLabel={t('notDone', 'Not Done')} />;
};

export default NotDoneTileComponent;
