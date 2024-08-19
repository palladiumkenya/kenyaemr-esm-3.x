import React, { ChangeEvent, useState } from 'react';
import { Filter } from '@carbon/react/icons';
import { Popover, PopoverContent, Button, Checkbox, usePrefix } from '@carbon/react';
import styles from './bill-summary.scss';

interface TableToolbarFilterProps {
  /**
   * Provide an function that is called when the apply button is clicked
   */
  onApplyFilter?: (selectedCheckboxes: Array<string>) => void;

  /**
   * Provide an function that is called when the reset button is clicked
   */
  onResetFilter?: () => void;
}

export const TableToolbarFilter = ({ onApplyFilter, onResetFilter }: TableToolbarFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

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
        <Filter />
      </button>
      <PopoverContent id="containerCheckbox">
        <div className={styles.checkBoxWrapper}>
          <fieldset className={`${prefix}--fieldset`}>
            <legend className={`${prefix}--label`}>Filter options</legend>
            <Checkbox
              labelText="Marc"
              id="checkbox1"
              onChange={handleCheckboxChange}
              checked={selectedCheckboxes.includes('Marc')}
            />
            <Checkbox
              labelText="300"
              id="checkbox2"
              onChange={handleCheckboxChange}
              checked={selectedCheckboxes.includes('300')}
            />
            <Checkbox
              labelText="80"
              id="checkbox3"
              onChange={handleCheckboxChange}
              checked={selectedCheckboxes.includes('80')}
            />
            <Checkbox
              labelText="Robin"
              id="checkbox4"
              onChange={handleCheckboxChange}
              checked={selectedCheckboxes.includes('Robin')}
            />
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
