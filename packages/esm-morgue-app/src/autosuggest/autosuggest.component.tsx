import React, { type HTMLAttributes, useEffect, useRef, useState } from 'react';
import { Layer, Search, type SearchProps } from '@carbon/react';
import classNames from 'classnames';
import styles from './autosuggest.scss';
import { showSnackbar } from '@openmrs/esm-framework';
import PatientSearchInfo from './patient-search-info.component';

// FIXME Temporarily included types from Carbon
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
  admissionLocation?: any;
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
  admissionLocation,
  ...searchProps
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchBox = useRef<HTMLInputElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const { id: name, labelText } = searchProps;
  const [showEmptyState, setShowEmptyState] = useState(false);

  useEffect(() => {
    const handleClickOutsideComponent = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) {
        setSuggestions([]);
        setShowEmptyState(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideComponent);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideComponent);
    };
  }, [wrapper]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onSuggestionSelected(name, undefined);

    if (query) {
      getSearchResults(query).then((results) => {
        const filteredResults = results.filter(
          (result) =>
            !admissionLocation?.bedLayouts
              .flatMap((bed) => bed.patients)
              .some((patient) => patient.uuid === result.patient.uuid),
        );
        setSuggestions(filteredResults);
      });
    } else {
      setSuggestions([]);
    }
  };

  const handleClear = () => {
    onSuggestionSelected(name, undefined);
    setSuggestions([]);
  };

  const handleClick = (index: number) => {
    const display = getDisplayValue(suggestions[index]);
    const value = getFieldValue(suggestions[index]);
    searchBox.current.value = display;
    onSuggestionSelected(name, value);
    setSuggestions([]);
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

      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleClick(index)} role="presentation">
              {renderSuggestionItem ? (
                <PatientSearchInfo patient={suggestion.patient} disabled={false} />
              ) : (
                getDisplayValue(suggestion)
              )}
            </li>
          ))}
        </ul>
      )}
      {showEmptyState && searchBox.current?.value?.length >= 3 && typeof renderEmptyState === 'function' && (
        <span className={styles.suggestions}>{renderEmptyState(searchBox.current?.value)}</span>
      )}
      {invalid ? <label className={classNames(styles.invalidMsg)}>{invalidText}</label> : <></>}
    </div>
  );
};
