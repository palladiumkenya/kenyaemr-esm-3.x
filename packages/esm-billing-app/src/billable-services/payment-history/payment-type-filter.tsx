import React, { ChangeEvent, useState } from 'react';
import { Filter } from '@carbon/react/icons';
import { Popover, PopoverContent, Button, Checkbox, usePrefix, SkeletonIcon } from '@carbon/react';
import styles from './payment-history.scss';
import { usePaymentModes } from '../../billing.resource';
import { useTranslation } from 'react-i18next';

interface TableToolbarFilterProps {
  onApplyFilter?: (selectedCheckboxes: Array<string>) => void;
  onResetFilter?: () => void;
}

export const PaymentTypeFilter = ({ onApplyFilter, onResetFilter }: TableToolbarFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

  const { isLoading, paymentModes } = usePaymentModes(false);
  const { t } = useTranslation();

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

  if (isLoading) {
    return <SkeletonIcon className={styles.skeletonIcon} />;
  }

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
        <Filter />
      </button>
      <PopoverContent id="containerCheckbox">
        <div className={styles.checkBoxWrapper}>
          <fieldset className={`${prefix}--fieldset`}>
            <legend className={`${prefix}--label`}>Filter options</legend>
            {paymentModes.map((method) => (
              <Checkbox
                labelText={method.name}
                id={`checkbox-${method.name}`}
                onChange={handleCheckboxChange}
                checked={selectedCheckboxes.includes(method.name)}
              />
            ))}
          </fieldset>
        </div>
        <Button kind="secondary" title="Reset filters" onClick={handleResetFilter}>
          {t('resetFilters', ' Reset filters')}
        </Button>
        <Button kind="primary" title="Reset filters" onClick={handleApplyFilter}>
          {t('applyFilter', 'Apply filter')}
        </Button>
      </PopoverContent>
    </Popover>
  );
};
