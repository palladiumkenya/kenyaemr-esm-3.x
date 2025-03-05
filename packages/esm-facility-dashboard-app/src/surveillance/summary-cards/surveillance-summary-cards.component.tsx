import { Layer, SkeletonPlaceholder } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import SummaryCard from './summary-card.component';
import styles from './summary-card.scss';
const SurveillanceSummaryCards = () => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary, getIndication } = useFacilityDashboardSurveillance();

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
        header={t('hivNotlinked', 'HIV Not linked')}
        title={t('hivPositiveClientsnotLinkedToArt', 'HIV Positive Clients not linked to ART')}
        value={`${surveillanceSummary?.getHivPositiveNotLinked}`}
        mode={getIndication(
          surveillanceSummary?.getHivPositiveNotLinked,
          surveillanceSummary?.getHivTestedPositive,
          surveillanceSummary?.clinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('prepNotlinked', 'PREP Not linked')}
        title={t(
          'pregnantPostPartumWomenNotLinkedToPREP',
          'Pregnant / postpartum women at high risk not linked to PREP',
        )}
        value={`${surveillanceSummary?.getPregnantPostpartumNotInPrep}`}
        mode={getIndication(
          surveillanceSummary?.getPregnantPostpartumNotInPrep,
          surveillanceSummary?.getPregnantOrPostpartumClients,
          surveillanceSummary?.clinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('eacPending', 'EAC Pending')}
        title={t(
          'virallyUnSuppressedWithoutAdherenceCounselingFor2Weeks',
          'Virally Unsuppressed clients without enhanced adherence counseling (EAC) within 2 weeks',
        )}
        value={`${surveillanceSummary?.getVirallyUnsuppressedWithoutEAC}`}
        mode={getIndication(
          surveillanceSummary?.getVirallyUnsuppressedWithoutEAC,
          surveillanceSummary?.getVirallyUnsuppressed,
          surveillanceSummary?.clinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('vlDelayed', 'VL Delayed')}
        title={t('delayedVLTesting', 'Delayed Viral Load (VL) testing')}
        value={`${surveillanceSummary?.getEligibleForVlSampleNotTaken}`}
        mode={getIndication(
          surveillanceSummary?.getEligibleForVlSampleNotTaken,
          surveillanceSummary?.getEligibleForVl,
          surveillanceSummary?.clinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('dnapcrPending', 'DNA-PCR Pending')}
        title={t('HEIWithoutDNAPCR', 'HEI (6-8 WEEKS) without DNA PCR Results')}
        value={`${surveillanceSummary?.getHeiSixToEightWeeksWithoutPCRResults}`}
        mode={getIndication(
          surveillanceSummary?.getHeiSixToEightWeeksWithoutPCRResults,
          surveillanceSummary?.getHeiSixToEightWeeksOld,
          surveillanceSummary?.heiClinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('heiIncomplete', 'HEI Incomplete')}
        title={t('HEIWithoutFinalDocumentedOutcome', 'HEI (24 months) without final documented outcomes')}
        value={`${surveillanceSummary?.getHei24MonthsWithoutDocumentedOutcome}`}
        mode={getIndication(
          surveillanceSummary?.getHei24MonthsWithoutDocumentedOutcome,
          surveillanceSummary?.getHei24MonthsOld,
          surveillanceSummary?.heiClinicalActionThreshold,
        )}
      />
    </Layer>
  );
};

export default SurveillanceSummaryCards;
