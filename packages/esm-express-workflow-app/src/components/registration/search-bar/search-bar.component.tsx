import React, { useState } from 'react';
import styles from './search.scss';
import { ErrorState, navigate, showToast, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Add, CloseLarge } from '@carbon/react/icons';
import { Button, Column, ComboBox, InlineLoading, Search, Tile } from '@carbon/react';
import { type EligibilityResponse, type HIEBundleResponse, type IdentifierTypeItem, type LocalResponse } from '../type';
import { getNationalIdFromPatient, convertLocalPatientToFHIR } from '../helper';
import { searchPatientFromHIE, usePatient, useSHAEligibility } from './search-bar.resource';
import { PatientSearchConfig } from '../../../config-schema';
import { EmptySvg } from '../empty-svg/empty-svg.component';
import HIEDisplayCard from '../card/HIE-card/hie-card.component';
import LocalPatientCard from '../card/Local-card/local-card.component';

const SearchBar: React.FC = () => {
  const { t } = useTranslation();

  const addPatient = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  const { identifierTypes } = useConfig<PatientSearchConfig>();

  const identifierTypeItems: Array<IdentifierTypeItem> = identifierTypes.map((item) => ({
    id: item.identifierValue,
    key: item.identifierValue,
    name: item.identifierType,
    text: item.identifierType,
  }));

  const defaultIdentifierType: IdentifierTypeItem | undefined =
    identifierTypeItems.find((item) => item.key !== 'select-identifier-type') || identifierTypeItems[0];

  const [identifierType, setIdentifierType] = useState<string>(defaultIdentifierType?.key || '');
  const [isSearching, setIsSearching] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<HIEBundleResponse> | null>(null);
  const [localSearchResults, setLocalSearchResults] = useState<LocalResponse | null>(null);
  const [showDependentsForPatient, setShowDependentsForPatient] = useState<Set<string>>(new Set());
  const [searchedNationalId, setSearchedNationalId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncedPatients, setSyncedPatients] = useState<Set<string>>(new Set());

  const [selectedIdentifierItem, setSelectedIdentifierItem] = useState<IdentifierTypeItem | null>(
    defaultIdentifierType || null,
  );

  // Use the existing hook for eligibility data
  const { data: eligibilityResponse, isLoading: isEligibilityLoading } = useSHAEligibility(searchedNationalId);

  // Use the existing hook for local patient search
  const { patient: localPatientData, isLoading: isLocalSearching } = usePatient(searchQuery);

  const handleIdentifierTypeChange = (selectedItem: IdentifierTypeItem | null): void => {
    if (selectedItem) {
      setIdentifierType(selectedItem.key);
      setSelectedIdentifierItem(selectedItem);
    } else {
      setIdentifierType('');
      setSelectedIdentifierItem(null);
    }
  };

  const getHiePatientCount = (results: Array<HIEBundleResponse> | null): number => {
    if (!results || !Array.isArray(results)) return 0;
    return results.reduce((total, bundle) => {
      return total + (bundle.entry ? bundle.entry.length : 0);
    }, 0);
  };

  const clearAll = () => {
    setIdentifier('');
    setSearchResults(null);
    setLocalSearchResults(null);
    setHasSearched(false);
    setSyncedPatients(new Set());
    setSearchedNationalId('');
    setShowDependentsForPatient(new Set());
    setSearchQuery('');
    setSelectedIdentifierItem(defaultIdentifierType || null);
    setIdentifierType(defaultIdentifierType?.key || '');
  };

  const renderSearchResults = () => {
    if (!hasSearched) return null;

    const hasHieResults =
      searchResults &&
      Array.isArray(searchResults) &&
      searchResults.length > 0 &&
      searchResults.some((bundle) => bundle.total > 0 && bundle.entry && bundle.entry.length > 0);

    const hasLocalResults = localSearchResults && Array.isArray(localSearchResults) && localSearchResults.length > 0;

    // if (!hasHieResults && !hasLocalResults) {
    //   return <ErrorState subTitle={t('checkFilters', 'Please check the filters above and try again')} />;
    // }

    return (
      <div className={styles.searchResultsContainer}>
        {hasHieResults && (
          <div className={styles.hieResultsSection}>
            <div className={styles.resultsHeader}>
              <span className={styles.identifierTypeHeader}>
                {t('hieResults', 'Patient(s) found {{count}}', {
                  count: getHiePatientCount(searchResults),
                })}
              </span>
            </div>
            <div>
              {searchResults!.map((bundle, index) => (
                <HIEDisplayCard
                  key={`hie-${index}`}
                  bundle={bundle}
                  bundleIndex={index}
                  searchedNationalId={searchedNationalId}
                />
              ))}
            </div>
          </div>
        )}

        {hasLocalResults && !syncedPatients.has(convertLocalPatientToFHIR(localSearchResults[0]).id) && (
          <div className={styles.localResultsSection}>
            <div className={styles.resultsHeader}>
              <span className={styles.identifierTypeHeader}>{t('revisitPatient', 'Revisit patient')}</span>
            </div>
            <div>
              <LocalPatientCard
                localSearchResults={localSearchResults}
                syncedPatients={syncedPatients}
                searchedNationalId={searchedNationalId}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSearchPatient = async () => {
    if (!identifierType || !identifier.trim()) {
      showToast({
        title: t('validationError', 'Validation Error'),
        kind: 'warning',
        description: t('selectIdentifierAndNumber', 'Please select an identifier type and enter an identifier number'),
      });
      return;
    }

    setIsSearching(true);
    setSearchResults(null);
    setLocalSearchResults(null);
    setHasSearched(false);
    setSyncedPatients(new Set());
    setSearchedNationalId('');
    setShowDependentsForPatient(new Set());

    try {
      console.log('Step 1: Starting HIE search...');
      console.log('Step 2: Starting eligibility check...');
      console.log('Step 3: Starting local search...');

      // Set search query for local search hook (this will trigger the usePatient hook)
      setSearchQuery(identifier.trim());

      // Run HIE search - the local search will be handled by the usePatient hook automatically
      const [hiePatientData] = await Promise.allSettled([searchPatientFromHIE(identifierType, identifier.trim())]);

      console.log('HIE search completed');

      // Process HIE results
      let normalizedHieResults: Array<HIEBundleResponse> | null = null;
      if (hiePatientData.status === 'fulfilled' && hiePatientData.value) {
        console.log('HIE search successful:', hiePatientData.value);
        if (Array.isArray(hiePatientData.value)) {
          normalizedHieResults = hiePatientData.value;
        } else {
          normalizedHieResults = [hiePatientData.value];
        }
        setSearchResults(normalizedHieResults);

        // Set National ID from HIE results for eligibility check
        const firstPatient = normalizedHieResults[0]?.entry?.[0]?.resource;
        if (firstPatient) {
          const nationalId = getNationalIdFromPatient(firstPatient);
          if (nationalId) {
            console.log('Step 2a: Checking eligibility for National ID:', nationalId);
            setSearchedNationalId(nationalId);
          }
        }
      } else if (hiePatientData.status === 'rejected') {
        console.error('HIE search failed:', hiePatientData.reason);
      }

      setHasSearched(true);
    } catch (error: any) {
      console.error('Unexpected error during search:', error);
      setHasSearched(true);
      showToast({
        title: t('error', 'Error'),
        kind: 'error',
        description: t('searchFailed', 'Failed to search for patient. Please try again.'),
      });
    } finally {
      setIsSearching(false);
      console.log('Search process completed');
    }
  };

  // Process local patient data from hook
  React.useEffect(() => {
    if (localPatientData && localPatientData.length > 0 && hasSearched) {
      console.log('Local search successful:', localPatientData);
      setLocalSearchResults(localPatientData);
    }
  }, [localPatientData, hasSearched]);

  // Log eligibility results when available
  React.useEffect(() => {
    if (eligibilityResponse && searchedNationalId) {
      console.log('Eligibility check successful:', eligibilityResponse);
    }
  }, [eligibilityResponse, searchedNationalId]);

  return (
    <>
      <Tile className={styles.patientSearchTile}>
        <span className={styles.formHeaderSection}>{t('clientRegistry', 'Client registry verification')}</span>
        <div className={styles.searchForm}>
          <div className={styles.searchRow}>
            <Column className={styles.identifierTypeColumn}>
              <ComboBox
                onChange={({ selectedItem }: { selectedItem: IdentifierTypeItem | null }) =>
                  handleIdentifierTypeChange(selectedItem)
                }
                id="formIdentifierType"
                titleText={t('identificationType', 'Identification Type')}
                placeholder={t('chooseIdentifierType', 'Choose identifier type')}
                items={identifierTypeItems}
                itemToString={(item: IdentifierTypeItem) => (item ? item.name : '')}
                className={styles.comboBox}
                selectedItem={selectedIdentifierItem}
                initialSelectedItem={defaultIdentifierType}
              />
            </Column>

            <Column className={styles.identifierNumberColumn}>
              <span className={styles.identifierTypeHeader}>{t('identifierNumber', 'Identifier number*')}</span>
              <Search
                labelText={t('enterIdentifierNumber', 'Enter identifier number')}
                className={styles.formSearch}
                value={identifier}
                placeholder={t('enterIdentifierNumber', 'Enter identifier number')}
                id="formSearchHealthWorkers"
                onChange={(value) => setIdentifier(value.target.value)}
                onKeyPress={(event) => {
                  if (event.key === 'Enter' && !isSearching && identifierType && identifier.trim()) {
                    handleSearchPatient();
                  }
                }}
              />
            </Column>
            <Column>
              <Button
                kind="primary"
                onClick={handleSearchPatient}
                size="md"
                renderIcon={SearchIcon}
                disabled={isSearching || !identifierType || !identifier.trim()}
                className={styles.searchButton}>
                {isSearching || isLocalSearching ? (
                  <div style={{ alignItems: 'center' }}>
                    <InlineLoading status="active" description={t('pullFromHIE', 'Pulling from registry...')} />
                  </div>
                ) : (
                  t('searchPatients', 'Search for Patient(s)')
                )}
              </Button>
            </Column>
          </div>

          <div className={styles.buttonContainer}>
            <Button
              kind="secondary"
              onClick={addPatient}
              size="md"
              renderIcon={Add}
              className={styles.clearButton}
              disabled={isSearching}>
              {t('emergencyRegistration', 'Emergency registration')}
            </Button>

            <Button
              kind="danger"
              onClick={clearAll}
              size="md"
              renderIcon={CloseLarge}
              className={styles.registrationButtons}
              disabled={isSearching}>
              {t('clearAll', 'Clear All')}
            </Button>
          </div>
        </div>
      </Tile>
      <div className={styles.searchResults}>
        {renderSearchResults() ?? (
          <div className={styles.emptyStateContainer}>
            <EmptySvg />
            <p className={styles.title}>{t('searchForAPatient', 'Search for a patient')}</p>
            <p className={styles.subTitle}>
              {t('enterPatientIdentifier', 'Enter patient identifier number to search for a patient')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
