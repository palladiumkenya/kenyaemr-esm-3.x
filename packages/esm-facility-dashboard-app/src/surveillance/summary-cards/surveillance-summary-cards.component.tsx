import React from 'react';
import { Layer } from '@carbon/react';
import styles from './summary-card.scss';
import SummaryCard from './summary-card.component';
import { useTranslation } from 'react-i18next';
const SurveillanceSummaryCards = () => {
  const { t } = useTranslation();
  return (
    <Layer className={styles.cardcontainer}>
      <SummaryCard
        header={t('hivUnlinked', 'HIV Unlinked')}
        title={t('hivPositiveClientsnotLinkedToArt', 'HIV Positive Clients not linked to ART')}
        value="100"
      />
      <SummaryCard
        header={t('prepUnlinked', 'PREP Unlinked')}
        title={t(
          'pregnantPostPartumWomenNotLinkedToPREP',
          'Pregnant / postpartum women at high risk not linked to PREP',
        )}
        value="300"
      />
      <SummaryCard
        header={t('eacPending', 'EAC Pending')}
        title={t(
          'virallyUnSupressedWithoutAdherancecancelingFor2Weeks',
          'Virally Unsupressed clients without enhanced addherance counceling (EAC) within 2 weeks',
        )}
        value="1200"
      />
      <SummaryCard
        header={t('vlDelayed', 'VL Delayed')}
        title={t('delayedVLTesting', 'Delayed Viral Load (VL) testing')}
        value="1800"
      />
      <SummaryCard
        header={t('dnapcrPending', 'DNA-PCR Pending')}
        title={t('HEIWithoutDNAPCR', 'HEI (6-8 WEEKS) without DNA PCR Results')}
        value="72"
      />
      <SummaryCard
        header={t('heiIncomplete', 'HEI Incomplete')}
        title={t('HEIWithoutFinalDocumentedOutcome', 'HEI (24 months) without final documented outcomes')}
        value="36000"
      />
    </Layer>
  );
};

export default SurveillanceSummaryCards;
