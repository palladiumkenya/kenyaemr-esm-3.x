import React from 'react';
import { useBillableItem } from '../useBillableItem';
import { useTranslation } from 'react-i18next';
import { InlineNotification, InlineLoading, Tile } from '@carbon/react';
import PriceInfoOrder from './price-info-order.componet';

type LabOrderProps = {
  order: {
    testType?: {
      label: string;
      conceptUuid: string;
    };
  };
};

const LabOrder: React.FC<LabOrderProps> = ({ order }) => {
  const { t } = useTranslation();
  const { billableItem, isLoading, error } = useBillableItem(order?.testType?.conceptUuid);

  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }

  if (error || !billableItem) {
    return (
      <InlineNotification
        kind="info"
        title={t('noprice', 'No price found ')}
        subtitle={t('noInfo', 'Please contact the cashier')}
        lowContrast
      />
    );
  }

  return <PriceInfoOrder billableItem={billableItem} />;
};

export default LabOrder;
