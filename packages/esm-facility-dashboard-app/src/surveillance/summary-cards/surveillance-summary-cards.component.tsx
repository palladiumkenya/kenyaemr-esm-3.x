import { Layer, SkeletonPlaceholder } from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useFacilityDashboardSurveillance from '../../hooks/useFacilityDashboardSurveillance';
import SummaryCard from './summary-card.component';
import styles from './summary-card.scss';
const SurveillanceSummaryCards = () => {
  const { t } = useTranslation();
  const { error, isLoading, surveillanceSummary, getIndication, getPercentage } = useFacilityDashboardSurveillance();

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
        header={t('hivNotlinked', 'HIV +ve not linked')}
        title={t('hivPositiveClientsnotLinkedToArt', 'Number of HIV +ve Clients not linked to ART')}
        value={`${surveillanceSummary?.getHivPositiveNotLinked}/${surveillanceSummary?.getHivTestedPositive}`}
        percentage={getPercentage(
          surveillanceSummary?.getHivPositiveNotLinked,
          surveillanceSummary?.getHivTestedPositive,
        )}
        mode={getIndication(
          surveillanceSummary?.getHivPositiveNotLinked,
          surveillanceSummary?.getHivTestedPositive,
          surveillanceSummary?.clinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('prepNotlinked', 'High risk +ve PBFW not on PrEP')}
        title={t('pbfwNotLinked', 'High risk -ve PBFW Not linked to PrEP')}
        value={`${surveillanceSummary?.getPregnantPostpartumNotInPrep}/${surveillanceSummary?.getPregnantOrPostpartumClients}`}
        percentage={getPercentage(
          surveillanceSummary?.getPregnantPostpartumNotInPrep,
          surveillanceSummary?.getPregnantOrPostpartumClients,
        )}
        mode={getIndication(
          surveillanceSummary?.getPregnantPostpartumNotInPrep,
          surveillanceSummary?.getPregnantOrPostpartumClients,
          surveillanceSummary?.clinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('delayedEAC', 'Delayed EAC')}
        title={t(
          'virallyUnSuppressedWithoutAdherenceCounselingFor2Weeks',
          'Virally Unsuppressed clients without enhanced adherence counseling (EAC) within 2 weeks',
        )}
        value={`${surveillanceSummary?.getVirallyUnsuppressedWithoutEAC}/${surveillanceSummary?.getVirallyUnsuppressed}`}
        mode={getIndication(
          surveillanceSummary?.getVirallyUnsuppressedWithoutEAC,
          surveillanceSummary?.getVirallyUnsuppressed,
          surveillanceSummary?.clinicalActionThreshold,
        )}
        percentage={getPercentage(
          surveillanceSummary?.getVirallyUnsuppressedWithoutEAC,
          surveillanceSummary?.getVirallyUnsuppressed,
        )}
      />
      <SummaryCard
        header={t('missedoppotunityVL', 'Missed opportunity VL')}
        title={t(
          'delayedVLTesting',
          'Number of client on ART that visited, were eligible for VL sampling and no VL was done',
        )}
        value={`${surveillanceSummary?.getEligibleForVlSampleNotTaken}/${surveillanceSummary?.getEligibleForVl}`}
        percentage={getPercentage(
          surveillanceSummary?.getEligibleForVlSampleNotTaken,
          surveillanceSummary?.getEligibleForVl,
        )}
        mode={getIndication(
          surveillanceSummary?.getEligibleForVlSampleNotTaken,
          surveillanceSummary?.getEligibleForVl,
          surveillanceSummary?.clinicalActionThreshold,
        )}
      />
      <SummaryCard
        header={t('dnapcrPending', 'Pending DNA-PCR Results')}
        title={t('heiWithoutDNAPCR', 'HEI (6-8 WEEKS) without DNA PCR Results')}
        value={`${surveillanceSummary?.getHeiSixToEightWeeksWithoutPCRResults}/${surveillanceSummary.getHeiSixToEightWeeksOld}`}
        percentage={getPercentage(
          surveillanceSummary?.getHeiSixToEightWeeksWithoutPCRResults,
          surveillanceSummary.getHeiSixToEightWeeksOld,
        )}
        mode={
          surveillanceSummary?.getHeiSixToEightWeeksWithoutPCRResults >= surveillanceSummary?.heiClinicalActionThreshold
            ? 'increasing'
            : 'decreasing'
        }
      />
      <SummaryCard
        header={t('heiFinalOutcomes', 'HEI Final Outcomes')}
        title={t('heiWithoutFinalDocumentedOutcome', '24 months old HEI without documented outcome')}
        value={`${surveillanceSummary?.getHei24MonthsWithoutDocumentedOutcome}/${surveillanceSummary.getHei24MonthsOld}`}
        percentage={getPercentage(
          surveillanceSummary?.getHei24MonthsWithoutDocumentedOutcome,
          surveillanceSummary?.getHei24MonthsOld,
        )}
        mode={
          surveillanceSummary?.getHei24MonthsWithoutDocumentedOutcome >= surveillanceSummary?.heiClinicalActionThreshold
            ? 'increasing'
            : 'decreasing'
        }
      />
    </Layer>
  );
};

export default SurveillanceSummaryCards;
