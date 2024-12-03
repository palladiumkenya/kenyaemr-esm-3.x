import { SkeletonText, Tile } from '@carbon/react';
import React from 'react';
import { usePaymentModes } from '../../billing.resource';
import { convertToCurrency } from '../../helpers';
import { MappedBill } from '../../types';
import styles from './payment-history.scss';
import { usePaymentTotals } from './use-payment-totals';

export const PaymentTotals = ({
  renderedRows,
  appliedFilters,
}: {
  renderedRows: Array<MappedBill> | null;
  appliedFilters: Array<string>;
}) => {
  const { isLoading, paymentModes } = usePaymentModes();
  const paymentTotals = usePaymentTotals(renderedRows);

  const selectedPaymentTypeCheckBoxes = appliedFilters.filter((f) => paymentModes.find((m) => m.name === f));

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
