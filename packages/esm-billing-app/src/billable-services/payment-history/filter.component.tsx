import { Button, Popover, PopoverContent, usePrefix } from '@carbon/react';
import { Filter as FilterIcon } from '@carbon/react/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MappedBill } from '../../types';
import { CashierFilter } from './cashier-filter.component';
import styles from './payment-history.scss';
import { PaymentTypeFilter } from './payment-type-filter.component';
import { ServiceTypeFilter } from './service-type-filter.component';

interface FilterProps {
  applyFilters: (filters: Array<string>) => void;
  resetFilters: () => void;
  bills: MappedBill[];
}

export const Filter = ({ applyFilters, resetFilters, bills }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedPaymentTypeCheckBoxes, setSelectedPaymentTypeCheckBoxes] = useState<Array<string>>([]);
  const [selectedCashierCheckboxes, setSelectedCashierCheckboxes] = useState<Array<string>>([]);
  const [selectedServiceTypeCheckboxes, setSelectedServiceTypeCheckboxes] = useState<Array<string>>([]);

  const { t } = useTranslation();
  const prefix = usePrefix();

  const handleApplyFilter = () => {
    applyFilters([...selectedCashierCheckboxes, ...selectedPaymentTypeCheckBoxes, ...selectedServiceTypeCheckboxes]);
    setIsOpen(false);
  };

  const handleResetFilter = () => {
    resetFilters();
    setSelectedPaymentTypeCheckBoxes([]);
    setSelectedCashierCheckboxes([]);
    setSelectedServiceTypeCheckboxes([]);
    setIsOpen(false);
  };

  const applyCashierFilter = (appliedCashierCheckboxes: Array<string>) => {
    setSelectedCashierCheckboxes(appliedCashierCheckboxes);
  };

  const applyPaymentTypeFilter = (appliedPaymentTypeCheckboxes: Array<string>) => {
    setSelectedPaymentTypeCheckBoxes(appliedPaymentTypeCheckboxes);
  };

  const applyServiceTypeFilter = (appliedServiceTypes: Array<string>) => {
    setSelectedServiceTypeCheckboxes(appliedServiceTypes);
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
        <FilterIcon />
      </button>
      <PopoverContent id="containerCheckbox">
        <div className={styles.checkBoxWrapper}>
          <ServiceTypeFilter
            applyServiceTypeFilter={applyServiceTypeFilter}
            bills={bills}
            selectedServiceTypeCheckboxes={selectedServiceTypeCheckboxes}
          />
          <PaymentTypeFilter
            applyPaymentTypeFilter={applyPaymentTypeFilter}
            selectedPaymentTypeCheckBoxes={selectedPaymentTypeCheckBoxes}
          />
          <CashierFilter
            applyCashierFilter={applyCashierFilter}
            bills={bills}
            selectedCashierCheckboxes={selectedCashierCheckboxes}
          />
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
