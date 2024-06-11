import React from 'react';
import { useTranslation } from 'react-i18next';
import SummaryTile from '../summary-tiles/summary-tile.component';

const ApprovedTileComponent = () => {
  const { t } = useTranslation();

  return <SummaryTile label={t('approved', 'Approved')} value={0} headerLabel={t('approved', 'Approved')} />;
};

export default ApprovedTileComponent;
