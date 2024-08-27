import React, { ChangeEvent, useState } from 'react';
import { IbmCloudLogging } from '@carbon/react/icons';
import { Popover, PopoverContent, Button, Checkbox, usePrefix, SkeletonIcon } from '@carbon/react';
import styles from './payment-history.scss';
import { MappedBill } from '../../types';

interface CashierFilterProps {
  onApplyFilter?: (selectedCheckboxes: Array<string>) => void;
  onResetFilter?: () => void;
  bills: MappedBill[];
}

export const CashierFilter = ({ onApplyFilter, onResetFilter, bills }: CashierFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

  const cashiers = Array.from(new Map(bills.map((bill) => [bill.cashier.uuid, bill.cashier])).values());

  const prefix = usePrefix();

  const handleApplyFilter = () => {
    setIsOpen(false);
    if (onApplyFilter) {
      onApplyFilter(selectedCheckboxes);
    }
  };

  const handleResetFilter = () => {
    setIsOpen(false);
    setSelectedCheckboxes([]);
    if (onResetFilter) {
      onResetFilter();
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checkboxId = e.target.id;
    const isChecked = e.target.checked;

    const checkboxValue: HTMLSpanElement | null = document.querySelector(`label[for="${checkboxId}"]`);

    if (isChecked && checkboxValue) {
      setSelectedCheckboxes([...selectedCheckboxes, checkboxValue.innerText]);
    } else {
      setSelectedCheckboxes(selectedCheckboxes.filter((item) => item !== checkboxValue?.innerText));
    }
  };

  return (
    <Popover align={'left'} caret={true} open={isOpen} onRequestClose={() => setIsOpen(false)}>
      <button
        aria-label="Filtering"
        type="button"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`${prefix}--toolbar-action ${prefix}--overflow-menu`}>
        <IbmCloudLogging />
      </button>
      <PopoverContent id="containerCheckbox">
        <div className={styles.checkBoxWrapper}>
          <fieldset className={`${prefix}--fieldset`}>
            <legend className={`${prefix}--label`}>Filter by cashier</legend>
            {cashiers.map((cashier) => (
              <Checkbox
                labelText={cashier.display}
                id={`checkbox-${cashier.display}`}
                onChange={handleCheckboxChange}
                checked={selectedCheckboxes.includes(cashier.display)}
              />
            ))}
          </fieldset>
        </div>
        <Button kind="secondary" title="Reset filters" onClick={handleResetFilter}>
          Reset filters
        </Button>
        <Button kind="primary" title="Reset filters" onClick={handleApplyFilter}>
          Apply filter
        </Button>
      </PopoverContent>
    </Popover>
  );
};
