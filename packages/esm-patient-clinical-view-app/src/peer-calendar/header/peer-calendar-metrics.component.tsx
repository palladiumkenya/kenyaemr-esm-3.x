import { Button, Layer, Row, SkeletonText, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useConfig, useSession } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigObject } from '../../config-schema';
import useContacts from '../../hooks/useContacts';
import styles from './peer-calendar-header.scss';

interface PeerCalendarMetricsHeaderProps {}

const PeerCalendarMetricsHeader: React.FC<PeerCalendarMetricsHeaderProps> = () => {
  const {
    user: {
      person: { uuid: peerEducatorUuid, display },
    },
  } = useSession();
  const { peerEducatorRelationship } = useConfig<ConfigObject>();
  const { contacts, error, isLoading } = useContacts(
    peerEducatorUuid,
    (rel) => rel.relationshipType.uuid === peerEducatorRelationship,
  );
  const { t } = useTranslation();

  const handleAddPeer = () => {
    launchPatientWorkspace('peers-form', {});
  };

  if (isLoading) {
    return (
      <Layer className={styles.detailHeaderContainer}>
        <Tile className={styles.detailHeaderContentLoading}>
          <Row className={styles.detailHeaderContentRow}>
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonText style={{ maxWidth: '100px' }} key={index} />
            ))}
          </Row>
          <hr />
          <Row className={styles.detailHeaderContentRow}>
            <SkeletonText style={{ maxWidth: '100px' }} />
            <SkeletonText style={{ maxWidth: '100px' }} />
          </Row>
        </Tile>
      </Layer>
    );
  }

  return (
    <Layer className={styles.detailHeaderContainer}>
      <Tile className={styles.detailHeaderContent}>
        <Row className={styles.detailHeaderContentRow}>
          <span>Reporting Period:</span>
          <strong>{contacts.length ?? 0}</strong>
          <span>Completed:</span>
          <strong>{contacts.length ?? 0}</strong>
          <span>Pending:</span>
          <strong>{0}</strong>
          <span>Total:</span>
          <strong>{contacts.length}</strong>
        </Row>
        <hr />
        <Row className={styles.detailHeaderContentRow}>
          <span>Peer Educator</span>
          <strong>{display}</strong>
        </Row>
      </Tile>
      <Row className={styles.btnSet}>
        <div />
        <Row className={styles.btnSetRight}>
          <Button kind="secondary" renderIcon={ArrowRight} onClick={handleAddPeer}>
            {t('addPeer', 'Add Peer')}
          </Button>
        </Row>
      </Row>
    </Layer>
  );
};

export default PeerCalendarMetricsHeader;
