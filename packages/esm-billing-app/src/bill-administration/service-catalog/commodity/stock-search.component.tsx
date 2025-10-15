import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, Search, InlineLoading } from '@carbon/react';
import { ErrorState, ResponsiveWrapper, useDebounce } from '@openmrs/esm-framework';
import { useCommodityItem } from './useCommodityItem';
import type { UseFormSetValue } from 'react-hook-form';
import type { BillableFormSchema } from '../form-schemas';
import { formatStockItemToPayload } from '../form-helper';
import styles from './commodity-form.scss';

interface StockItem {
  uuid: string;
  commonName: string;
}

type StockItemSearchProps = {
  setValue: UseFormSetValue<BillableFormSchema>;
  defaultStockItem?: string;
};

const StockItemSearch: React.FC<StockItemSearchProps> = ({ setValue, defaultStockItem }) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>(defaultStockItem ?? '');
  const [searchTerm, setSearchTerm] = useState<string>(defaultStockItem ? '' : '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(null);

  const { stockItems = [], isLoading, error } = useCommodityItem(debouncedSearchTerm);

  useEffect(() => {
    if (defaultStockItem && !selectedStockItem) {
      setSelectedStockItem(stockItems.find((item) => item.uuid === defaultStockItem) ?? null);
    }
  }, [defaultStockItem, selectedStockItem, setValue, stockItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e?.currentTarget?.value ?? '';
    setInputValue(v);
    setSearchTerm(v);
    setSelectedStockItem(null);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchTerm('');
    setSelectedStockItem(null);
  };

  const handleStockItemSelect = (item: StockItem) => {
    setSelectedStockItem(item);
    setInputValue(item.commonName);
    setSearchTerm(''); // hide results
    const payload = formatStockItemToPayload(item);
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
          placeholder={t('searchForCommodity', 'Search for commodity')}
          labelText={t('search', 'Search')}
          closeButtonLabelText={t('clear', 'Clear')}
          value={inputValue}
          onChange={handleInputChange}
          onClear={handleClear}
          disabled={Boolean(defaultStockItem)}
        />
      </ResponsiveWrapper>

      {isLoading && (
        <div className={styles.searchResults}>
          <InlineLoading status="active" iconDescription="Loading" description={t('loadingData', 'Loading data...')} />
        </div>
      )}

      {!isLoading && stockItems.length > 0 && searchTerm && (
        <div className={styles.searchResults} role="listbox">
          {stockItems.map((item) => (
            <div
              key={item.uuid}
              className={styles.searchItem}
              role="option"
              aria-selected={selectedStockItem?.uuid === item.uuid}
              tabIndex={0}
              onClick={() => handleStockItemSelect(item)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleStockItemSelect(item);
                }
              }}>
              {item.commonName}
            </div>
          ))}
        </div>
      )}
    </FormGroup>
  );
};

export default StockItemSearch;
