import React from 'react';
import { usePaymentTotals } from './use-payment-totals';
import { Tile, SkeletonText } from '@carbon/react';
import { convertToCurrency } from '../../helpers';
import { MappedBill } from '../../types';
import styles from './payment-history.scss';
import { usePaymentModes } from '../../billing.resource';

export const PaymentTotals = ({
  renderedRows,
  selectedPaymentTypeCheckBoxes,
}: {
  renderedRows: MappedBill[] | null;
  selectedPaymentTypeCheckBoxes: string[];
}) => {
  const { isLoading } = usePaymentModes();
  const paymentTotals = usePaymentTotals(renderedRows);

  if (isLoading) {
    return (
      <div className={styles.loadingPaymentTotals}>
        {Array.from({ length: 4 }).map(() => (
          <Tile className={styles.tile}>
            <SkeletonText className={styles.loadingPaymentTotal} style={{ width: '50%' }} />
            <SkeletonText />
          </Tile>
        ))}
      </div>
    );
  }

  if (selectedPaymentTypeCheckBoxes.length === 0) {
    return (
      <div className={styles.paymentTotals}>
        {paymentTotals.map((total) => (
          <Tile className={styles.tile}>
            {total.type}
            <p className={styles.paymentTotal}>{convertToCurrency(total.total)}</p>
          </Tile>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.paymentTotals}>
      {paymentTotals
        .filter((total) => selectedPaymentTypeCheckBoxes.includes(total.type))
        .map((total) => (
          <Tile className={styles.tile}>
            {total.type}
            <p className={styles.paymentTotal}>{convertToCurrency(total.total)}</p>
          </Tile>
        ))}
    </div>
  );
};
