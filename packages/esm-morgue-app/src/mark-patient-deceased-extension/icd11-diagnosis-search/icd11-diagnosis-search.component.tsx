import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Search, InlineLoading, Stack, Tag } from '@carbon/react';
import debounce from 'lodash-es/debounce';
import { Checkmark, Close } from '@carbon/react/icons';
import styles from './icd11-diagnosis-search.scss';
import { useDiagnosis } from '../mark-patient-deceased-workspace/mark-patient-deceased.resource';
import { DiagnosisOption } from '../type';

interface ICD11DiagnosisSearchProps {
  id: string;
  labelText: string;
  value: DiagnosisOption | null | undefined;
  onChange: (diagnosis: DiagnosisOption | null) => void;
  required?: boolean;
  invalid?: boolean;
  invalidText?: string;
  placeholder?: string;
}

const ICD11DiagnosisSearch: React.FC<ICD11DiagnosisSearchProps> = ({
  id,
  labelText,
  value,
  onChange,
  required = false,
  invalid = false,
  invalidText,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { diagnoses, isLoading } = useDiagnosis(searchQuery);

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query);
        setShowResults(query.length >= 3);
      }, 300),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    debouncedSearch(query);
  };

  const handleSelectDiagnosis = (diagnosis: DiagnosisOption) => {
    onChange(diagnosis);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClearSelection = () => {
    onChange(null);
    setSearchQuery('');
    setShowResults(false);
  };

  const hasValidValue = value && value.uuid && value.display;

  return (
    <Stack gap={4}>
      <div className={styles.searchWrapper}>
        <p className="cds--label">{labelText}</p>
        <Search
          id={id}
          labelText={labelText}
          placeholder={placeholder || t('searchPlaceholder', 'Type to search (minimum 3 characters)...')}
          onChange={handleSearchChange}
          size="md"
          className={classNames({ [styles.invalid]: invalid })}
        />

        {showResults && searchQuery.length >= 3 && (
          <div className={styles.searchResults}>
            {isLoading && (
              <div className={styles.loadingState}>
                <InlineLoading description={t('searching', 'Searching...')} />
              </div>
            )}

            {!isLoading && diagnoses && diagnoses.length > 0 && (
              <div className={styles.resultsList}>
                {diagnoses.map((diagnosis) => {
                  const isSelected = value?.uuid === diagnosis.uuid;
                  return (
                    <div
                      key={diagnosis.uuid}
                      className={classNames(styles.resultItem, {
                        [styles.selected]: isSelected,
                      })}
                      onClick={() => handleSelectDiagnosis(diagnosis)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectDiagnosis(diagnosis);
                        }
                      }}>
                      <span className={styles.diagnosisText}>{diagnosis.display}</span>
                      {isSelected && <Tag type="green" size="sm" className={styles.selectedTag}></Tag>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {searchQuery.length > 0 && searchQuery.length < 3 && (
          <div className={styles.hint}>
            <InlineLoading description={t('minimumCharacters', 'Type at least 3 characters to search')} />
          </div>
        )}
      </div>

      {hasValidValue && (
        <div className={styles.selectedDiagnosis}>
          <Tag type="gray" size="md" className={styles.selectedValueTag}>
            {value.display}
          </Tag>
        </div>
      )}

      {invalid && invalidText && <div className={styles.errorMessage}>{invalidText}</div>}
    </Stack>
  );
};

export default ICD11DiagnosisSearch;
