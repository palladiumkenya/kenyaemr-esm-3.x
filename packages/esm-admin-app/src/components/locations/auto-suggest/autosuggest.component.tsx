import { InlineLoading, Layer, Search } from '@carbon/react';
import classNames from 'classnames';
import React, { type HTMLAttributes, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './autosuggest.scss';

type InputPropsBase = Omit<HTMLAttributes<HTMLInputElement>, 'onChange'>;

interface SearchProps extends InputPropsBase {
  autoComplete?: string;
  className?: string;
  closeButtonLabelText?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  isExpanded?: boolean;
  id?: string;
  labelText: React.ReactNode;
  onChange?(e: { target: HTMLInputElement; type: 'change' }): void;
  onClear?(): void;
  onExpand?(e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>): void;
  placeholder?: string;
  renderIcon?: React.ComponentType | React.FunctionComponent;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: string;
  value?: string | number;
}

interface AutosuggestProps extends SearchProps {
  getDisplayValue: (item: any) => string;
  getFieldValue: (item: any) => string;
  getSearchResults: (query: string) => Promise<any>;
  onSuggestionSelected: (field: string, value: string) => void;
  invalid?: boolean;
  invalidText?: string;
  renderSuggestionItem?: (item: any) => React.ReactNode;
  renderEmptyState?: (value: any) => React.ReactNode;
}

export const Autosuggest: React.FC<AutosuggestProps> = ({
  getDisplayValue,
  getFieldValue,
  getSearchResults,
  onSuggestionSelected,
  invalid,
  invalidText,
  renderSuggestionItem,
  renderEmptyState,
  ...searchProps
}) => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchBox = useRef<HTMLInputElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const { id: name, labelText } = searchProps;

  useEffect(() => {
    const handleClickOutsideComponent = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideComponent);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideComponent);
    };
  }, [wrapper]);

  const handleChange = (e) => {
    const query = e.target.value;
    onSuggestionSelected(name, undefined);

    if (query && query.trim()) {
      setIsLoading(true);
      getSearchResults(query.trim())
        .then((results) => {
          setSuggestions(results || []);
          setIsLoading(false);
        })
        .catch((error) => {
          setSuggestions([]);
          setIsLoading(false);
        });
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    onSuggestionSelected(name, undefined);
    setSuggestions([]);
    setIsLoading(false);
  };

  const handleClick = (index: number) => {
    const selectedSuggestion = suggestions[index];
    if (selectedSuggestion) {
      const fieldValue = getFieldValue(selectedSuggestion);
      const displayValue = getDisplayValue(selectedSuggestion);
      if (searchBox.current) {
        searchBox.current.value = displayValue;
      }
      onSuggestionSelected(name, fieldValue);
      setSuggestions([]);
    }
  };

  return (
    <div className={styles.autocomplete} ref={wrapper}>
      <label className="cds--label">{labelText}</label>
      <Layer className={classNames({ [styles.invalid]: invalid })}>
        <Search
          id="autosuggest"
          onChange={handleChange}
          onClear={handleClear}
          ref={searchBox}
          className={styles.autocompleteSearch}
          {...searchProps}
        />
      </Layer>
      {isLoading && (
        <div className={styles.loading}>
          <InlineLoading status="active" description={t('loading', 'Loading' + '...')} />
        </div>
      )}
      {suggestions.length > 0 ? (
        <ul className={styles.suggestions}>
          {suggestions.map((suggestion, index) => {
            return (
              <li
                key={getFieldValue(suggestion) || index}
                onClick={() => handleClick(index)}
                role="presentation"
                style={{ cursor: 'pointer' }}>
                {renderSuggestionItem ? renderSuggestionItem(suggestion) : getDisplayValue(suggestion)}
              </li>
            );
          })}
        </ul>
      ) : (
        !isLoading && renderEmptyState && renderEmptyState(searchBox.current?.value || '')
      )}
      {invalid && <label className={classNames(styles.invalidMsg)}>{invalidText}</label>}
    </div>
  );
};
