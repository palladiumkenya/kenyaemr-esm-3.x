import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tiles/summary-tile.component';
import { useProcedureOrderStats } from '../summary-tiles/radiology-summary.resource';

const ReviewTileComponent = () => {
  const { t } = useTranslation();

  const { count: completedCount } = useProcedureOrderStats('COMPLETED');
  return (
    <SummaryTile
      label={t('underReview', 'Under Review')}
      value={completedCount}
      headerLabel={t('pendingReview', 'Pending Review')}
    />
  );
};

export default ReviewTileComponent;
