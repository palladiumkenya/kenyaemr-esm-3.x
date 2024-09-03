import React from 'react';
import styles from './service-form.scss';
import { useTranslation } from 'react-i18next';
import { FormGroup, Search, InlineLoading } from '@carbon/react';
import { ResponsiveWrapper } from '@openmrs/esm-framework';

type ConceptSearchProps = {
  setConceptToLookup: (value: string) => void;
  conceptToLookup: string;
  selectedConcept: any;
  handleSelectConcept: (concept: any) => void;
  errors: any;
  isSearching: boolean;
  concepts: any;
  defaultValues: any;
};

const ConceptSearch: React.FC<ConceptSearchProps> = ({
  selectedConcept,
  setConceptToLookup,
  conceptToLookup,
  defaultValues,
  errors,
  isSearching,
  concepts,
  handleSelectConcept,
}) => {
  const { t } = useTranslation();
  return (
    <FormGroup className={styles.formGroupWithConcept} legendText={t('serviceConcept', 'Service Concept')}>
      <ResponsiveWrapper>
        <Search
          placeholder={t('searchForConcept', 'Search for concept')}
          labelText={t('search', 'Search')}
          closeButtonLabelText={t('clear', 'Clear')}
          onChange={(e) => setConceptToLookup(e.target.value)}
          value={
            selectedConcept
              ? selectedConcept?.concept?.display
              : conceptToLookup ?? defaultValues?.concept?.concept?.display
          }
          invalid={!!errors.concept}
          invalidText={errors?.concept?.message}
        />
      </ResponsiveWrapper>
      {isSearching && (
        <div className={styles.searchResults}>
          <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />
        </div>
      )}
      {concepts && concepts.length > 0 && !isSearching && (
        <div className={styles.searchResults}>
          {concepts.map((concept) => (
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleSelectConcept(concept)}
              key={concept.concept.uuid}
              className={styles.searchItem}>
              {concept.concept.display}
            </div>
          ))}
        </div>
      )}
    </FormGroup>
  );
};

export default ConceptSearch;
