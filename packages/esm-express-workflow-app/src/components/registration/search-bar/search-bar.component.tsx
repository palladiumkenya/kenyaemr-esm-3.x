import React, { useState, useEffect } from 'react';
import styles from './search.scss';
import { navigate, showToast, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Add, CloseLarge } from '@carbon/react/icons';
import { Button, Column, ComboBox, InlineLoading, Search, Tile } from '@carbon/react';
import { type HIEBundleResponse, type IdentifierTypeItem, type LocalResponse } from '../type';
import { getNationalIdFromPatient, convertLocalPatientToFHIR } from '../helper';
import { searchPatientFromHIE, usePatient, useSHAEligibility } from './search-bar.resource';
import { EmptySvg } from '../empty-svg/empty-svg.component';
import HIEDisplayCard from '../card/HIE-card/hie-card.component';
import { ExpressWorkflowConfig } from '../../../config-schema';
import LocalPatientCard from '../card/Local-card/local-card.component';

const SearchBar: React.FC = () => {
  const { t } = useTranslation();
  const addPatient = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  const { identifierTypes, otpExpirationDurationInminutes } = useConfig<ExpressWorkflowConfig>();

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

  const { eligibilityData: eligibilityResponse, isLoading: isEligibilityLoading } =
    useSHAEligibility(searchedNationalId);
  const { patient: localPatientData, isLoading: isLocalSearching } = usePatient(searchQuery);

  useEffect(() => {
    if (localPatientData && searchQuery) {
      const localResults: LocalResponse = Array.isArray(localPatientData) ? localPatientData : [localPatientData];
      setLocalSearchResults(localResults);
    } else if (searchQuery && !isLocalSearching && !localPatientData) {
      setLocalSearchResults(null);
    }
  }, [localPatientData, searchQuery, isLocalSearching]);

  const handleIdentifierTypeChange = (selectedItem: IdentifierTypeItem | null): void => {
    if (selectedItem) {
      setIdentifierType(selectedItem.key);
      setSelectedIdentifierItem(selectedItem);
    } else {
      setIdentifierType('');
      setSelectedIdentifierItem(null);
    }
  };

  const getLocalPatientNationalIds = (results: LocalResponse | null): Set<string> => {
    const nationalIds = new Set<string>();

    if (!results || !Array.isArray(results)) {
      return nationalIds;
    }

    results.forEach((patient) => {
      const fhirPatient = convertLocalPatientToFHIR(patient);
      const nationalId = getNationalIdFromPatient(fhirPatient);
      if (nationalId) {
        nationalIds.add(nationalId);
      }
    });

    return nationalIds;
  };

  const filterHieResults = (
    hieResults: Array<HIEBundleResponse> | null,
    localResults: LocalResponse | null,
  ): Array<HIEBundleResponse> | null => {
    if (!hieResults || !Array.isArray(hieResults)) {
      return hieResults;
    }
    if (!localResults || !Array.isArray(localResults)) {
      return hieResults;
    }

    const localNationalIds = getLocalPatientNationalIds(localResults);

    const filteredResults = hieResults
      .map((bundle) => {
        const filteredEntries =
          bundle.entry?.filter((entry) => {
            const nationalId = getNationalIdFromPatient(entry.resource);
            return nationalId ? !localNationalIds.has(nationalId) : true;
          }) || [];

        return {
          ...bundle,
          entry: filteredEntries,
          total: filteredEntries.length,
        };
      })
      .filter((bundle) => bundle.entry && bundle.entry.length > 0);

    return filteredResults.length > 0 ? filteredResults : null;
  };

  const getHiePatientCount = (results: Array<HIEBundleResponse> | null): number => {
    if (!results || !Array.isArray(results)) {
      return 0;
    }
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
    if (!hasSearched) {
      return null;
    }

    const filteredHieResults = filterHieResults(searchResults, localSearchResults);
    const hasHieResults =
      filteredHieResults &&
      Array.isArray(filteredHieResults) &&
      filteredHieResults.length > 0 &&
      filteredHieResults.some((bundle) => bundle.total > 0 && bundle.entry && bundle.entry.length > 0);
    const hasLocalResults = localSearchResults && Array.isArray(localSearchResults) && localSearchResults.length > 0;

    if (!hasHieResults && !hasLocalResults) {
      return (
        <div className={styles.emptyStateContainer}>
          <EmptySvg />
          <p className={styles.title}>{t('noPatientFound', 'No Patient Found')}</p>
          <p className={styles.subTitle}>
            {t('tryDifferentIdentifier', 'Try searching with a different identifier or check the identifier type')}
          </p>
        </div>
      );
    }

    return (
      <div className={styles.searchResultsContainer}>
        {hasLocalResults && (
          <div className={styles.localResultsSection}>
            <div className={styles.resultsHeader}>
              <span className={styles.identifierTypeHeader}>
                {t('revisitPatientResults', 'Revisit patient(s) ({{count}})', {
                  count: localSearchResults?.length || 0,
                })}
              </span>
            </div>
            <div>
              <LocalPatientCard
                localSearchResults={localSearchResults!}
                syncedPatients={syncedPatients}
                searchedNationalId={searchedNationalId}
                otpExpiryMinutes={otpExpirationDurationInminutes}
                hieSearchResults={searchResults}
                eligibilityResponse={eligibilityResponse}
                isEligibilityLoading={isEligibilityLoading}
              />
            </div>
          </div>
        )}

        {hasHieResults && (
          <div className={styles.hieResultsSection}>
            <div className={styles.resultsHeader}>
              <span className={styles.identifierTypeHeader}>
                {t('newPatientResults', 'New patient(s) found ({{count}})', {
                  count: getHiePatientCount(filteredHieResults),
                })}
              </span>
            </div>
            <div>
              {filteredHieResults!.map((bundle, index) => (
                <HIEDisplayCard
                  key={`hie-${index}`}
                  bundle={bundle}
                  bundleIndex={index}
                  searchedNationalId={searchedNationalId}
                  otpExpiryMinutes={otpExpirationDurationInminutes}
                  localSearchResults={localSearchResults}
                  eligibilityResponse={eligibilityResponse}
                  isEligibilityLoading={isEligibilityLoading}
                />
              ))}
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
      setSearchQuery(identifier.trim());

      const [hiePatientData] = await Promise.allSettled([searchPatientFromHIE(identifierType, identifier.trim())]);

      let normalizedHieResults: Array<HIEBundleResponse> | null = null;
      if (hiePatientData.status === 'fulfilled' && hiePatientData.value) {
        if (Array.isArray(hiePatientData.value)) {
          normalizedHieResults = hiePatientData.value;
        } else {
          normalizedHieResults = [hiePatientData.value];
        }
        setSearchResults(normalizedHieResults);

        const firstPatient = normalizedHieResults[0]?.entry?.[0]?.resource;
        if (firstPatient) {
          const nationalId = getNationalIdFromPatient(firstPatient);
          if (nationalId) {
            setSearchedNationalId(nationalId);
          }
        }
      }

      setHasSearched(true);
    } catch (error: any) {
      setHasSearched(true);
      showToast({
        title: t('error', 'Error'),
        kind: 'error',
        description: t('searchFailed', 'Failed to search for patient. Please try again.'),
      });
    } finally {
      setIsSearching(false);
    }
  };

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
              <div className={styles.searchInputContainer}>
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
                <Button
                  kind="primary"
                  onClick={handleSearchPatient}
                  size="md"
                  renderIcon={isSearching || isLocalSearching ? undefined : SearchIcon}
                  className={styles.attachedSearchButton}
                  disabled={isSearching || !identifierType || !identifier.trim()}>
                  {isSearching || isLocalSearching ? (
                    <>
                      <InlineLoading status="active" />
                      <span className={styles.loadingText}>{t('searching', 'Searching...')}</span>
                    </>
                  ) : (
                    t('searchPatients', 'Search for Patient(s)')
                  )}
                </Button>
              </div>
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
