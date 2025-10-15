import React from 'react';
import { useBillableItem } from '../useBillableItem';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import PriceInfoOrder from './price-info-order.componet';

type ProcedureOrderProps = {
  order: {
    testType?: {
      label: string;
      conceptUuid: string;
    };
  };
  setHasPrice: (hasPrice: boolean) => void;
};

const ProcedureOrder: React.FC<ProcedureOrderProps> = ({ order, setHasPrice }) => {
  const { t } = useTranslation();
  const { billableItem, isLoading, error } = useBillableItem(order?.testType?.conceptUuid);

  if (isLoading) {
    return (
      <InlineLoading
        status="active"
        iconDescription={t('loading', 'Loading')}
        description={t('loadingData', 'Loading data...')}
      />
    );
  }

  return <PriceInfoOrder billableItem={billableItem} error={error} />;
};

export default ProcedureOrder;
