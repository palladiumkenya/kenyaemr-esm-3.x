import { Button, Tile, Layer } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import {
  CardHeader,
  EmptyDataIllustration,
  EmptyState,
  getPatientUuidFromUrl,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import React, { useState } from 'react';
import styles from './benebfits-table.scss';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Package } from '../../types';

const BenefitsTable = () => {
  const { t } = useTranslation();
  const patientUuid = getPatientUuidFromUrl();
  const [eligibleBenefits, setEligibleBenefits] = useState([]);
  const [eligible, setEligible] = useState(false);

  const handleLaunchRequestEligibility = () => {
    launchPatientWorkspace('benefits-eligibility-request-form', {
      workspaceTitle: 'Benefits Eligibility Request Form',
      patientUuid,
      onSuccess: (eligibleBenefits: Array<Package>) => {
        setEligibleBenefits(eligibleBenefits);
        setEligible(true);
      },
    });
  };

  if (!eligible) {
    return (
      <div>
        <Layer>
          <Tile className={styles.tile}>
            <CardHeader title={t('benefits', 'Benefits')}>
              <Button
                kind="ghost"
                renderIcon={ArrowRight}
                onClick={handleLaunchRequestEligibility}
                className={styles.btnOutline}>
                {t('requestEligibility', 'Request Eligibility')}
              </Button>
            </CardHeader>
            <EmptyDataIllustration />
            <p className={styles.content}>{t('noBenefits', 'No benefit packages, request eligibility')}</p>
            <Button onClick={handleLaunchRequestEligibility} renderIcon={ArrowRight} kind="ghost">
              {t('requestEligibility', 'Request Eligibility')}
            </Button>
          </Tile>
        </Layer>
      </div>
    );
  }
  if (eligibleBenefits.length === 0) {
    return <EmptyState headerTitle={t('benefits', 'Benefits')} displayText={t('benefits', 'Benefits')} />;
  }
};

export default BenefitsTable;
