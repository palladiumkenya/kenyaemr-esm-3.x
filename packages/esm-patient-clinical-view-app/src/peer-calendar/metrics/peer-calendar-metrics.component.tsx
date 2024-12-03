import { Button, Layer, Row, SkeletonPlaceholder } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Peer, ReportingPeriod } from '../../types';
import styles from './metrics.scss';
import MetricsCard from './peer-calendar-metrics-card.component';

interface PeerCalendarMetricsHeaderProps {
  reportigPeriod?: Partial<ReportingPeriod>;
  setReportingPeriod: React.Dispatch<React.SetStateAction<ReportingPeriod>>;
  completedPeers?: Array<string>;
  peers?: Array<Peer>;
  isLoading?: boolean;
}

const PeerCalendarMetricsHeader: React.FC<PeerCalendarMetricsHeaderProps> = ({
  setReportingPeriod,
  reportigPeriod,
  isLoading = true,
  completedPeers = [],
  peers = [],
}) => {
  const {
    user: {
      person: { display },
    },
  } = useSession();

  const { t } = useTranslation();
  const handleAddPeer = () => {
    launchPatientWorkspace('peers-form', {});
  };

  if (isLoading) {
    return (
      <Layer className={styles.detailHeaderContainer}>
        <Layer className={styles.metricsContainer}>
          <SkeletonPlaceholder className={styles.metricCard} />
          <SkeletonPlaceholder className={styles.metricCard} />
          <SkeletonPlaceholder className={styles.metricCard} />
        </Layer>
      </Layer>
    );
  }

  return (
    <Layer className={styles.detailHeaderContainer}>
      <Layer className={styles.metricsContainer}>
        <MetricsCard title={t('total', 'Total')} header={t('totalPeers', 'Total Peers')} value={peers.length} />
        <MetricsCard
          title={t('pending', 'Pending')}
          header={t('pendingDocumentations', 'Pending Documentation')}
          value={peers.length - completedPeers.length}
        />
        <MetricsCard
          title={t('completed', 'Completed')}
          header={t('completedDocumentations', 'Completed Documentation')}
          value={completedPeers.length}
        />
      </Layer>
      <Row className={styles.btnSet}>
        <div />
        <Row className={styles.btnSetRight}>
          <Button kind="secondary" renderIcon={Add} onClick={handleAddPeer}>
            {t('addPeer', 'Add Peer')}
          </Button>
        </Row>
      </Row>
    </Layer>
  );
};

export default PeerCalendarMetricsHeader;
