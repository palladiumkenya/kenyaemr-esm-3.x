import { Layer, SkeletonPlaceholder } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework/src';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import SummaryCard from './summary-card.component';
import styles from './summary-card.scss';
const SurveillanceSummaryCards = () => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary } = useFacilityDashboardSurveillance();

  if (isLoading) {
    return (
      <Layer className={styles.cardcontainer}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonPlaceholder className={styles.summaryCard} key={index} />
        ))}
      </Layer>
    );
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('surveillanceSummary', 'Surveillance Summary')} />;
  }

  return (
    <Layer className={styles.cardcontainer}>
      <SummaryCard
        header={t('hivUnlinked', 'HIV Unlinked')}
        title={t('hivPositiveClientsnotLinkedToArt', 'HIV Positive Clients not linked to ART')}
        value="100"
        mode="decreasing"
      />
      <SummaryCard
        header={t('prepUnlinked', 'PREP Unlinked')}
        title={t(
          'pregnantPostPartumWomenNotLinkedToPREP',
          'Pregnant / postpartum women at high risk not linked to PREP',
        )}
        value="300"
        mode="increasing"
      />
      <SummaryCard
        header={t('eacPending', 'EAC Pending')}
        title={t(
          'virallyUnSupressedWithoutAdherancecancelingFor2Weeks',
          'Virally Unsupressed clients without enhanced addherance counceling (EAC) within 2 weeks',
        )}
        value="1200"
        mode="increasing"
      />
      <SummaryCard
        header={t('vlDelayed', 'VL Delayed')}
        title={t('delayedVLTesting', 'Delayed Viral Load (VL) testing')}
        value="1800"
        mode="decreasing"
      />
      <SummaryCard
        header={t('dnapcrPending', 'DNA-PCR Pending')}
        title={t('HEIWithoutDNAPCR', 'HEI (6-8 WEEKS) without DNA PCR Results')}
        value="72"
        mode="decreasing"
      />
      <SummaryCard
        header={t('heiIncomplete', 'HEI Incomplete')}
        title={t('HEIWithoutFinalDocumentedOutcome', 'HEI (24 months) without final documented outcomes')}
        value="36000"
        mode="decreasing"
      />
    </Layer>
  );
};

export default SurveillanceSummaryCards;
