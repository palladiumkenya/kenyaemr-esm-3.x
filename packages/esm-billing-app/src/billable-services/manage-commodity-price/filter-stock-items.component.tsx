import React from 'react';
import { RadioButton, RadioButtonGroup } from '@carbon/react';
import styles from './filter-stock-items.scss';

interface FilterStockItemsProps {
  filterType: string;
  changeFilterType: React.Dispatch<React.SetStateAction<string>>;
}

const FilterStockItems: React.FC<FilterStockItemsProps> = ({ filterType, changeFilterType }) => {
  return (
    <RadioButtonGroup
      name="is-drug"
      defaultSelected={filterType}
      onChange={changeFilterType}
      className={styles.spacing}>
      <RadioButton labelText="All" value="" id="is-drug-all" />
      <RadioButton labelText="Pharmaceuticals" value="true" id="is-drug-drug" />
      <RadioButton labelText="Non Pharmaceuticals" value="false" id="is-drug-other" />
    </RadioButtonGroup>
  );
};

export default FilterStockItems;
