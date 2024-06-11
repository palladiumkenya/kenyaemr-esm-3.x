import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tiles/summary-tile.component';
import { useProcedureOrderStats } from '../summary-tiles/procedure-summary.resource';

const ReferredOutTileComponent = () => {
  const { t } = useTranslation();
  const { count: referredOutCount } = useProcedureOrderStats('EXCEPTION');

  return (
    <SummaryTile
      label={t('referredOut', 'Referred Out')}
      value={referredOutCount}
      headerLabel={t('referredOut', 'Referred Out')}
    />
  );
};

export default ReferredOutTileComponent;
