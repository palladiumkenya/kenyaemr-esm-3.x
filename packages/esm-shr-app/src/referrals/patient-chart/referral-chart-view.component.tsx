import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, Tile, DataTableSkeleton, InlineLoading } from '@carbon/react';
import styles from './referral-chart-view.component.scss';
import { ErrorState, formatDate, isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, EmptyState } from '@openmrs/esm-patient-common-lib';
import { useCommunityReferral } from '../refferals.resource';
import { ReferralConfigObject } from '../../config-schema';

export interface ReferralReasonsDialogPopupProps {
  patient: fhir.Patient;
}

const ReferralReasonsView: React.FC<ReferralReasonsDialogPopupProps> = ({ patient }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { nationalPatientUniqueIdentifier } = useConfig<ReferralConfigObject>();
  const getPatientNupiNumber = (patient: fhir.Patient, nationalPatientUniqueIdentifier: string): string | undefined => {
    return patient?.identifier.find((item) => {
      return item.type.coding.some((coding) => coding.code === nationalPatientUniqueIdentifier);
    })?.value;
  };

  const nationalPatientUniqueNumber = getPatientNupiNumber(patient, nationalPatientUniqueIdentifier);

  const { referral, isLoading, isValidating, isError } = useCommunityReferral(nationalPatientUniqueNumber);
  const headerTitle = t('referral', 'Referrals');

  if (!nationalPatientUniqueNumber) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>
            {t(
              'missingNupiIdentiferMessage',
              'The patient is missing  national patient unique identifier (NUPI). Please register the patient with the client registry to retrieve their referrals.',
            )}
          </p>
        </Tile>
      </Layer>
    );
  }

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }
  const isEmpty = Object.values(referral).every((arr) => Array.isArray(arr) && arr.length === 0);
  if (isEmpty) {
    return <EmptyState displayText={t('emptyReferralsMessage', ' referral data')} headerTitle={headerTitle} />;
  }

  if (isError) {
    return <ErrorState error={isError} headerTitle={headerTitle} />;
  }
  return (
    <>
      <CardHeader title={headerTitle}>
        {isValidating && <InlineLoading description={t('loading', 'Loading...')} />}
      </CardHeader>
      <div className={styles.container}>
        {referral?.referralReasons?.referralDate && (
          <ReferralCard
            label={t('referralDate', 'Referral Date')}
            value={formatDate(new Date(referral?.referralReasons?.referralDate))}
          />
        )}
        <ReferralCard label={t('status', 'Status')} value={referral?.status} />
        <ReferralCard label={t('reasonCode', 'Reason Code')} value={referral?.referralReasons?.reasonCode} />
        <ReferralCard label={t('clinicalNote', 'Clinical Note')} value={referral?.referralReasons?.clinicalNote} />
        <ReferralCard label={t('referredFrom', 'Referred From')} value={referral?.referredFrom} />
      </div>
    </>
  );
};

export default ReferralReasonsView;

const ReferralCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className={styles.cardContainer}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
};
