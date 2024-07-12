import React from 'react';
import { convertToCurrency } from '../../../helpers';
import { useBillableItem } from '../useBillableItem';
import { useTranslation } from 'react-i18next';
import styles from './lab-oder.scss';
import {
  InlineNotification,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Tile,
} from '@carbon/react';

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
    return (
      <InlineNotification
        kind="info"
        title={t('loadingPrices', 'Loading prices')}
        subtitle={t('pleaseWait', 'Please wait...')}
        lowContrast
      />
    );
  }

  if (error || !billableItem) {
    return (
      <InlineNotification
        kind="info"
        title={t('noprices', 'No procedural price found ')}
        subtitle={t('noInfo', 'Please contact the cashier')}
        lowContrast
      />
    );
  }

  return (
    <Tile id="" className={styles.prices}>
      <div className={styles.listContainer}>
        <StructuredListWrapper isCondensed>
          A
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head className={styles.cell}>
                {t('paymentMethods', 'Payment methods')}
              </StructuredListCell>
              <StructuredListCell head className={styles.cell}>
                {t('prices', 'Prices(Ksh)')}
              </StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {billableItem.servicePrices.map((priceItem) => (
              <StructuredListRow key={priceItem.uuid}>
                <StructuredListCell className={styles.cell}>{priceItem.paymentMode.name}</StructuredListCell>
                <StructuredListCell className={styles.cell}>{convertToCurrency(priceItem.price)}</StructuredListCell>
              </StructuredListRow>
            ))}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    </Tile>
  );
};

export default LabOrder;
