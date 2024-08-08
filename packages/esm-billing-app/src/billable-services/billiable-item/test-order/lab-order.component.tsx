import React, { useEffect, useState } from 'react';
import { useBillableItem } from '../useBillableItem';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import PriceInfoOrder from './price-info-order.componet';

type LabOrderProps = {
  order: {
    testType?: {
      label: string;
      conceptUuid: string;
    };
  };
  setHasPrice: (hasPrice: boolean) => void;
};

const LabOrder: React.FC<LabOrderProps> = ({ order, setHasPrice }) => {
  const { t } = useTranslation();
  const { billableItem, isLoading, error } = useBillableItem(order?.testType?.conceptUuid);

  useEffect(() => {
    if (billableItem) {
      setHasPrice(billableItem.servicePrices.length > 0);
    }
  }, [billableItem, setHasPrice]);

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loading', 'Loading')}
        description={t('loadingData', 'Loading data...')}
      />
    );
  }

  return <PriceInfoOrder billableItem={billableItem} error={error} setHasPrice={setHasPrice} />;
};

export default LabOrder;
