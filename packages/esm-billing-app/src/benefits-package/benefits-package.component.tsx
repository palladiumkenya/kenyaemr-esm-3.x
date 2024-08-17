import { Layer, Tile } from '@carbon/react';
import { useFeatureFlag } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import BenefitsHeader from './benefits-header.components';
import styles from './table/benebfits-table.scss';
import BenefitsTable from './table/benefits-table.component';

const BenefitsPackage = () => {
  const isBenefitsPackageEnabled = useFeatureFlag('benefits-package');
  const { t } = useTranslation();
  const headerTitle = t('benefits', 'Benefits');
  if (!isBenefitsPackageEnabled) {
    return (
      <div>
        <Layer>
          <Tile className={styles.tile}>
            <CardHeader title={headerTitle}>{''}</CardHeader>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t('unavailable', 'Benefits package feature is stil under active developement')}
            </p>
          </Tile>
        </Layer>
      </div>
    );
  }

  return (
    <div className={`omrs-main-content `}>
      <BenefitsHeader />
      <BenefitsTable />
    </div>
  );
};

export default BenefitsPackage;
