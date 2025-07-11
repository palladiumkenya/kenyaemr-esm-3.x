import { Tile } from '@carbon/react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResultsTile from '../common/results-tile.component';
import { searchLocation } from '../hooks/UseFacilityLocations';
import { LocationResponse } from '../types';
import { Autosuggest } from './autosuggest.component';
import styles from './location-autosuggest.scss';

interface LocationAutosuggestProps {
  onLocationSelected: (locationUuid: string, locationData: LocationResponse) => void;
  labelText?: string;
  placeholder?: string;
  invalid?: boolean;
  invalidText?: string;
}

export const LocationAutosuggest: React.FC<LocationAutosuggestProps> = ({
  onLocationSelected,
  labelText = 'Select Location',
  placeholder = 'Search for a location...',
  invalid = false,
  invalidText = 'Please select a valid location',
}) => {
  const [searchResults, setSearchResults] = useState<LocationResponse[]>([]);
  const { t } = useTranslation();

  const getDisplayValue = useCallback((item: LocationResponse) => {
    return item.display || item.name || '';
  }, []);

  const getFieldValue = useCallback((item: LocationResponse) => {
    return item.uuid || '';
  }, []);

  const handleSuggestionSelected = useCallback(
    (field: string, value: string) => {
      if (value) {
        const selected = searchResults.find((item) => item.uuid === value);
        if (selected) {
          onLocationSelected(value, selected);
        }
      }
    },
    [onLocationSelected, searchResults],
  );

  const handleSearchResults = useCallback(async (query: string) => {
    const results = await searchLocation(query);
    setSearchResults(results);
    return results;
  }, []);

  const renderSuggestionItem = useCallback((item: LocationResponse) => {
    return (
      <div>
        <ResultsTile location={item} />
      </div>
    );
  }, []);

  const renderEmptyState = useCallback((value: string) => {
    if (!value) {
      return null;
    }

    return (
      <div className={styles.tileContainer}>
        <Tile className={styles.tileNoContent}>
          <div className={styles.tileContents}>
            <p className={styles.content}>{t('searchNoResults', `Found no matching results`)}</p>
            <p className={styles.helper}>{t('searchNoResultsHelper', 'Try searching for a different term')}</p>
          </div>
        </Tile>
      </div>
    );
  }, []);

  return (
    <Autosuggest
      id="location-autosuggest"
      labelText={labelText}
      placeholder={placeholder}
      getDisplayValue={getDisplayValue}
      getFieldValue={getFieldValue}
      getSearchResults={handleSearchResults}
      onSuggestionSelected={handleSuggestionSelected}
      renderSuggestionItem={renderSuggestionItem}
      renderEmptyState={renderEmptyState}
      invalid={invalid}
      invalidText={invalidText}
    />
  );
};
