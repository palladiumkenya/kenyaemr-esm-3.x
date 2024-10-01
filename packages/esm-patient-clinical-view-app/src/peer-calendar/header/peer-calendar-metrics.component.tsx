import { Button, Column, Dropdown, Layer, Row, SkeletonText, Tile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useSession } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Contact, ReportingPeriod } from '../../types';
import { getAllMonthsInYear, getYearsAroundCurrentYear } from '../peer-calendar.resources';
import styles from './peer-calendar-header.scss';

interface PeerCalendarMetricsHeaderProps {
  reportigPeriod?: Partial<ReportingPeriod>;
  setReportingPeriod: React.Dispatch<React.SetStateAction<ReportingPeriod>>;
  completedPeers?: Array<string>;
  contacts?: Array<Contact>;
  isLoading?: boolean;
}

const PeerCalendarMetricsHeader: React.FC<PeerCalendarMetricsHeaderProps> = ({
  setReportingPeriod,
  reportigPeriod,
  isLoading = true,
  completedPeers = [],
  contacts = [],
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
  const months = useMemo(() => getAllMonthsInYear(), []);
  const years = useMemo(() => getYearsAroundCurrentYear(), []);

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
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonText style={{ maxWidth: '100px' }} key={index} />
            ))}
          </Row>
        </Tile>
      </Layer>
    );
  }

  return (
    <Layer className={styles.detailHeaderContainer}>
      <Tile className={styles.detailHeaderContent}>
        <Row className={styles.detailHeaderContentRow}>
          <span>Peer educator:</span>
          <strong>{display}</strong>
          <span>Completed:</span>
          <strong>{completedPeers.length}</strong>
          <span>Pending:</span>
          <strong>{contacts.length - completedPeers.length}</strong>
          <span>Total:</span>
          <strong>{contacts.length}</strong>
        </Row>
        <hr />
        <Row>
          <strong>Reporting Period</strong>
          <div className={styles.reportingPeriod}>
            <Column className={styles.reportingPeriodInput}>
              <Dropdown
                id="reportingMonth"
                onChange={(e) => {
                  setReportingPeriod((state) => ({ ...state, month: e.selectedItem }));
                }}
                initialSelectedItem={reportigPeriod?.month}
                label={t('reportingMonth', 'Month')}
                items={months.map((r) => r.index)}
                itemToString={(item) => months.find((r) => r.index === item)?.name ?? ''}
              />
            </Column>
            <Column className={styles.reportingPeriodInput}>
              <Dropdown
                id="reportingYear"
                onChange={(e) => {
                  setReportingPeriod((state) => ({ ...state, year: e.selectedItem }));
                }}
                initialSelectedItem={reportigPeriod?.year}
                label={t('reportingYear', 'Year')}
                items={years.map((r) => r)}
                itemToString={(item) => years.find((r) => r === item) ?? ''}
              />
            </Column>
          </div>
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
