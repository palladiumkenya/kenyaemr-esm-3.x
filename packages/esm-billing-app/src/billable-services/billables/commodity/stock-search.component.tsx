import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, Search, InlineLoading, CodeSnippet } from '@carbon/react';
import { ErrorState, ResponsiveWrapper, useDebounce } from '@openmrs/esm-framework';
import { useCommodityItem } from './useCommodityItem';
import { type UseFormSetValue } from 'react-hook-form';
import { BillableFormSchema } from '../form-schemas';
import { formatStockItemToPayload } from '../form-helper';
import styles from './commodity-form.scss';

type StockItemSearchProps = {
  setValue: UseFormSetValue<BillableFormSchema>;
  defaultStockItem?: string;
};

const StockItemSearch: React.FC<StockItemSearchProps> = ({ setValue, defaultStockItem }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedStockItem, setSelectedStockItem] = useState({});
  const { stockItems, isLoading, isValidating, error, mutate } = useCommodityItem(debouncedSearchTerm);

  const handleStockItemSelect = (stockItem) => {
    setSelectedStockItem(stockItem);
    setSearchTerm('');
    const payload = formatStockItemToPayload(stockItem);
    Object.entries(payload).forEach(([key, value]) => {
      setValue(key as keyof BillableFormSchema, value);
    });
  };

  if (error) {
    return <ErrorState headerTitle={t('stockItemError', 'Stock Item')} error={error} />;
  }

  return (
    <FormGroup className={styles.formGroupWithConcept} legendText={t('searchForCommodity', 'Search for commodity')}>
      <ResponsiveWrapper>
        <Search
          placeholder={t('searchForCommodity', 'Search for commodity ')}
          labelText={t('search', 'Search')}
          closeButtonLabelText={t('clear', 'Clear')}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={selectedStockItem?.['commonName']}
          defaultValue={defaultStockItem}
          disabled={Boolean(defaultStockItem)}
        />
      </ResponsiveWrapper>
      {isLoading && (
        <div className={styles.searchResults}>
          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
        </div>
      )}
      {stockItems && stockItems.length > 0 && !isLoading && searchTerm && (
        <div className={styles.searchResults}>
          {stockItems.map((stockItem) => (
            <div
              key={stockItem.uuid}
              className={styles.searchItem}
              role="button"
              tabIndex={0}
              onClick={() => handleStockItemSelect(stockItem)}>
              {stockItem.commonName}
            </div>
          ))}
        </div>
      )}
    </FormGroup>
  );
};

export default StockItemSearch;
