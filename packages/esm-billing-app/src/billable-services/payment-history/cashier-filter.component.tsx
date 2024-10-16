import { Checkbox, usePrefix } from '@carbon/react';
import React, { ChangeEvent } from 'react';
import { MappedBill } from '../../types';
import styles from './payment-history.scss';

export const CashierFilter = ({
  selectedCashierCheckboxes,
  bills,
  applyCashierFilter,
}: {
  selectedCashierCheckboxes: Array<string>;
  bills: MappedBill[];
  applyCashierFilter: (filters: Array<string>) => void;
}) => {
  const cashiers = Array.from(new Map(bills.map((bill) => [bill.cashier.uuid, bill.cashier])).values());

  const prefix = usePrefix();

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checkboxId = e.target.id;
    const isChecked = e.target.checked;

    const checkboxValue: HTMLSpanElement | null = document.querySelector(`label[for="${checkboxId}"]`);

    if (isChecked && checkboxValue) {
      applyCashierFilter([...selectedCashierCheckboxes, checkboxValue.innerText]);
    } else {
      applyCashierFilter(selectedCashierCheckboxes.filter((item) => item !== checkboxValue?.innerText));
    }
  };

  return (
    <div className={styles.checkBoxWrapper}>
      <fieldset className={`${prefix}--fieldset`}>
        <legend className={`${prefix}--label`}>Cashiers</legend>
        {cashiers.length === 0 && <p className={styles.noCashiersInRange}>No Cashiers In Bills Range</p>}
        {cashiers.map((cashier) => (
          <Checkbox
            labelText={cashier.display}
            id={`checkbox-${cashier.display}`}
            onChange={handleCheckboxChange}
            checked={selectedCashierCheckboxes.includes(cashier.display)}
          />
        ))}
      </fieldset>
    </div>
  );
};
