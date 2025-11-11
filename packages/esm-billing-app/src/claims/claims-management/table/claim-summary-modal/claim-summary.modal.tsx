import { Button, ModalBody, ModalFooter, ModalHeader, Tag } from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FacilityClaim } from '../../../../types';
import { useFacilityClaims } from '../use-facility-claims';
import { statusColors } from '../../../utils';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import styles from './claim-summary.scss';
import upperCase from 'lodash-es/upperCase';

type ExtendedClaim = FacilityClaim & {
  id: string;
  providerName: string;
  patientName: string;
  patientId?: string;
  visitType?: { uuid: string; display: string };
  patient?: {
    uuid: string;
    display: string;
    person?: {
      display?: string;
      gender: string;
      age: number;
      birthdate: string;
    };
  };
};

export const ClaimSummaryModal = ({ closeModal, claimId }: { closeModal: () => void; claimId: string }) => {
  const { t } = useTranslation();
  const { claims } = useFacilityClaims();

  const claim = claims.find((claim) => claim.id === claimId) as ExtendedClaim | undefined;

  if (!claim) {
    return (
      <React.Fragment>
        <ModalHeader closeModal={closeModal}>{t('claimSummary', 'Claim Summary')}</ModalHeader>
        <ModalBody>
          <p>{t('claimNotFound', 'Claim not found')}</p>
        </ModalBody>
        <ModalFooter>
          <Button kind="primary" onClick={closeModal} type="button">
            {t('close', 'Close')}
          </Button>
        </ModalFooter>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal}>{t('claimSummary', 'Claim Summary')}</ModalHeader>
      <ModalBody>
        <div className={styles.container}>
          <CardHeader title={t('patientInformation', 'Patient Information')}>
            <div />
          </CardHeader>
          <div className={styles.section}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>{t('patientName', 'Patient Name')}</span>
                <span className={styles.value}>{upperCase(claim.patient?.person?.display) || '-'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>{t('gender', 'Gender')}</span>
                <span className={styles.value}>{claim.patient?.person?.gender || '-'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>{t('age', 'Age')}</span>
                <span className={styles.value}>
                  {claim.patient?.person?.age ? `${claim.patient.person.age} years` : '-'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>{t('birthdate', 'Birthdate')}</span>
                <span className={styles.value}>
                  {claim.patient?.person?.birthdate
                    ? formatDate(parseDate(claim.patient.person.birthdate), { time: false, noToday: true })
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          <CardHeader title={t('claimInformation', 'Claim Information')}>
            <div />
          </CardHeader>
          <div className={styles.section}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>{t('claimNumber', 'Claim Number')}</span>
                <span className={styles.value}>{t('CO-01878', 'CO-01878')}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>{t('dateFrom', 'Date From')}</span>
                <span className={styles.value}>
                  {claim.dateFrom ? formatDate(parseDate(claim.dateFrom), { time: false, noToday: true }) : '-'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>{t('dateTo', 'Date To')}</span>
                <span className={styles.value}>
                  {claim.dateTo ? formatDate(parseDate(claim.dateTo), { time: false, noToday: true }) : '-'}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>{t('visitType', 'Visit Type')}</span>
                <span className={styles.value}>{claim.visitType?.display || claim.use || '-'}</span>
              </div>
            </div>
          </div>

          <CardHeader title={t('providerInformation', 'Provider Information')}>
            <div />
          </CardHeader>
          <div className={styles.section}>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>{t('providerName', 'Provider Name')}</span>
                <span className={styles.value}>{claim.providerName || '-'}</span>
              </div>
            </div>
          </div>

          <CardHeader title={t('financialSummary', 'Financial Summary')}>
            <div />
          </CardHeader>
          <div className={styles.section}>
            <div className={styles.totalContainer}>
              <span className={styles.totalLabel}>{t('claimedAmount', 'Claimed Amount')}</span>
              <span className={styles.totalValue}>
                {claim.claimedTotal ? `KES ${claim.claimedTotal.toLocaleString()}` : 'KES 0'}
              </span>
            </div>
            <div className={styles.totalContainer}>
              <span className={styles.totalLabel}>{t('approvedAmount', 'Approved Amount')}</span>
              <span className={styles.totalValue}>
                {claim.approvedTotal ? `KES ${claim.approvedTotal.toLocaleString()}` : 'KES 0'}
              </span>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="primary" onClick={closeModal} type="button">
          {t('close', 'Close')}
        </Button>
      </ModalFooter>
    </React.Fragment>
  );
};
