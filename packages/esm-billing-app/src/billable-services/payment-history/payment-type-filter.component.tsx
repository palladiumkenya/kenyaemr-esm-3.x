import { Checkbox, SkeletonIcon, usePrefix } from '@carbon/react';
import React, { ChangeEvent } from 'react';
import { usePaymentModes } from '../../billing.resource';
import styles from './payment-history.scss';

export const PaymentTypeFilter = ({
  selectedPaymentTypeCheckBoxes,
  applyPaymentTypeFilter,
}: {
  selectedPaymentTypeCheckBoxes: Array<string>;
  applyPaymentTypeFilter: (filters: Array<string>) => void;
}) => {
  const { isLoading, paymentModes } = usePaymentModes(false);
  const prefix = usePrefix();

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checkboxId = e.target.id;
    const isChecked = e.target.checked;

    const checkboxValue: HTMLSpanElement | null = document.querySelector(`label[for="${checkboxId}"]`);

    if (isChecked && checkboxValue) {
      applyPaymentTypeFilter([...selectedPaymentTypeCheckBoxes, checkboxValue.innerText]);
    } else {
      applyPaymentTypeFilter(selectedPaymentTypeCheckBoxes.filter((item) => item !== checkboxValue?.innerText));
    }
  };

  if (isLoading) {
    return <SkeletonIcon className={styles.skeletonIcon} />;
  }

  return (
    <div className={styles.checkBoxWrapper}>
      <fieldset className={`${prefix}--fieldset`}>
        <legend className={`${prefix}--label`}>Payment Type</legend>
        {paymentModes.map((method) => (
          <Checkbox
            labelText={method.name}
            id={`checkbox-${method.name}`}
            onChange={handleCheckboxChange}
            checked={selectedPaymentTypeCheckBoxes.includes(method.name)}
          />
        ))}
      </fieldset>
    </div>
  );
};
