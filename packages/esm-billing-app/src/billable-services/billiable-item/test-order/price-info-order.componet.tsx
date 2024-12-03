import React from 'react';
import { convertToCurrency } from '../../../helpers';
import { useTranslation } from 'react-i18next';
import styles from './price-info-order.scss';
import {
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Tile,
  InlineNotification,
} from '@carbon/react';

type PriceInfoOrderProps = {
  billableItem: any;
  error?: boolean;
};

const PriceInfoOrder: React.FC<PriceInfoOrderProps> = ({ billableItem, error }) => {
  const { t } = useTranslation();

  const hasPrice = billableItem?.servicePrices?.length > 0;

  if (error || !hasPrice) {
    return (
      <InlineNotification kind="warning" title={t('noprice', 'No price configured for this service')} lowContrast />
    );
  }

  return (
    <Tile id="" className={styles.prices}>
      <div className={styles.listContainer}>
        <StructuredListWrapper isCondensed>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head className={styles.cell}>
                {t('paymentMethods', 'Payment methods')}
              </StructuredListCell>
              <StructuredListCell head className={styles.cell}>
                {t('prices', 'Prices (Ksh)')}
              </StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {billableItem.servicePrices.map((priceItem: any) => (
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

export default PriceInfoOrder;
