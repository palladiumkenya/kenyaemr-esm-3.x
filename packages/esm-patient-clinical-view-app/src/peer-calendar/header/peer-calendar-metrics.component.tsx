import { Button, Layer, Row, SkeletonText, Tile } from '@carbon/react';
import { Edit, Printer } from '@carbon/react/icons';
import { useConfig, useSession } from '@openmrs/esm-framework';
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
          <Button kind="primary" renderIcon={Edit}>
            {t('editManifest', 'Edit Manifest')}
          </Button>
          <Button kind="secondary" renderIcon={Printer}>
            {t('printManifest', 'Print Manifest')}
          </Button>
        </Row>
      </Row>
    </Layer>
  );
};

export default PeerCalendarMetricsHeader;
