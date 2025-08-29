import React, { useState } from 'react';
import styles from './search.scss';
import { navigate, showToast, useConfig } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Add, CloseLarge } from '@carbon/react/icons';
import { Button, Column, ComboBox, InlineLoading, Search, Tile } from '@carbon/react';
import { type EligibilityResponse, type HIEBundleResponse, type IdentifierTypeItem } from '../type';
import { getNationalIdFromPatient } from '../helper';
import { searchPatientFromHIE } from './search-bar.resource';
import { ExpressWorkflowConfig } from '../../../config-schema';

const SearchBar: React.FC = () => {
  const { t } = useTranslation();

  const addPatient = React.useCallback(() => navigate({ to: '${openmrsSpaBase}/patient-registration' }), []);

  const { identifierTypes } = useConfig<ExpressWorkflowConfig>();

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
  const [showDependentsForPatient, setShowDependentsForPatient] = useState<Set<string>>(new Set());
  const [eligibilityData, setEligibilityData] = useState<EligibilityResponse | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [searchedNationalId, setSearchedNationalId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedIdentifierItem, setSelectedIdentifierItem] = useState<IdentifierTypeItem | null>(
    defaultIdentifierType || null,
  );

  const handleIdentifierTypeChange = (selectedItem: IdentifierTypeItem | null): void => {
    if (selectedItem) {
      setIdentifierType(selectedItem.key);
      setSelectedIdentifierItem(selectedItem);
    } else {
      setIdentifierType('');
      setSelectedIdentifierItem(null);
    }
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
    // setLocalSearchResults(null);
    setHasSearched(false);
    // setSyncedPatients(new Set());
    setEligibilityData(null);
    setSearchedNationalId('');
    setShowDependentsForPatient(new Set());

    try {
      const hiePatientData = await searchPatientFromHIE(identifierType, identifier.trim());

      let normalizedHieResults: Array<HIEBundleResponse> | null = null;
      if (hiePatientData) {
        if (Array.isArray(hiePatientData)) {
          normalizedHieResults = hiePatientData;
        } else {
          normalizedHieResults = [hiePatientData];
        }
      }

      setSearchResults(normalizedHieResults);

      if (normalizedHieResults && normalizedHieResults.length > 0) {
        const firstPatient = normalizedHieResults[0]?.entry?.[0]?.resource;
        if (firstPatient) {
          const nationalId = getNationalIdFromPatient(firstPatient);
          if (nationalId) {
            setSearchedNationalId(nationalId);
          }
        }
      }

      setSearchQuery(identifier.trim());
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
              {isSearching ? (
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
            onClick={() => {}}
            size="md"
            renderIcon={CloseLarge}
            className={styles.registrationButtons}
            disabled={isSearching}>
            {t('clearAll', 'Clear All')}
          </Button>
        </div>
      </div>
    </Tile>
  );
};

export default SearchBar;
