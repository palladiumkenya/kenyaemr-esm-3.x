import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tiles/summary-tile.component';
import { useProcedureOrderStats } from '../summary-tiles/procedure-summary.resource';

const WorklistTileComponent = () => {
  const { t } = useTranslation();

  const { count: worklistCount } = useProcedureOrderStats('IN_PROGRESS');

  return (
    <SummaryTile label={t('inProgress', 'In progress')} value={worklistCount} headerLabel={t('worklist', 'Worklist')} />
  );
};

export default WorklistTileComponent;
