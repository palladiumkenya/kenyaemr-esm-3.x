import { Accordion, AccordionItem, Layer, Search } from '@carbon/react';
import React, { useState } from 'react';
import styles from './benefits.scss';
import { CheckmarkFilled } from '@carbon/react/icons';
import { useBenefitsData } from '../benefits-package.mock';
import BenefitsHeader from './benefits-header.component';
import { useTranslation } from 'react-i18next';
import EmptyStateSearch from '../empty-state/empty-state.component';

const Benefits: React.FC = () => {
  const { t } = useTranslation();
  const benefitsData = useBenefitsData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBenefits = benefitsData.filter((benefit) =>
    benefit.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={`omrs-main-content`}>
      <BenefitsHeader />
      <div className={styles.search}>
        <Search
          labelText={t('searchBenefits', 'Search benefits')}
          placeHolderText={t('searchByBenefit', 'Search by benefit')}
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
      </div>

      {filteredBenefits.length === 0 ? (
        <EmptyStateSearch
          title={t('noBenefitFound', 'No benefit found')}
          subTitle={t('noResultsSuggestion', `We couldn't find any matching benefit.`)}
        />
      ) : (
        filteredBenefits.map((benefit) => (
          <Accordion key={benefit.title}>
            <AccordionItem title={benefit.title}>
              <Layer className={styles.accordionLayer}>
                {benefit.description && (
                  <p className={styles.description}>
                    <strong>Description:</strong> {benefit?.description}
                  </p>
                )}
                <span>
                  <strong>Allocation: </strong>
                  {benefit.allocation}
                </span>
                <span>
                  <strong>Expenditure: </strong>
                  {benefit.expenditure}
                </span>
                <span>
                  <strong>Balance: </strong>
                  {benefit.balance}
                </span>
                <hr />
                <span className={styles.activeContainer}>
                  <CheckmarkFilled className={benefit.isActive ? styles.activeIcon : styles.inactiveIcon} />
                  <span className={benefit.isActive ? '' : styles.inactiveIcon}>
                    {benefit.isActive ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </Layer>
            </AccordionItem>
          </Accordion>
        ))
      )}
    </div>
  );
};

export default Benefits;
