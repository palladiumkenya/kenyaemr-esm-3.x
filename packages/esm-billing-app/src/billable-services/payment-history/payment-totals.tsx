import React from 'react';
import { usePaymentTotals } from './use-payment-totals';
import { Tile } from '@carbon/react';
import { convertToCurrency } from '../../helpers';
import { MappedBill } from '../../types';
import styles from './payment-history.scss';

export const PaymentTotals = ({
  renderedRows,
  selectedPaymentTypeCheckBoxes,
}: {
  renderedRows: MappedBill[] | null;
  selectedPaymentTypeCheckBoxes: string[];
}) => {
  const paymentTotals = usePaymentTotals(renderedRows);

  if (selectedPaymentTypeCheckBoxes.length === 0) {
    return (
      <div className={styles.paymentTotals}>
        {paymentTotals.map((total) => (
          <Tile className={styles.tile}>
            {total.type}
            <br />
            <br />
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
            <br />
            <br />
            <p className={styles.paymentTotal}>{convertToCurrency(total.total)}</p>
          </Tile>
        ))}
    </div>
  );
};
