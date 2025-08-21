import React from 'react';
import { InlineLoading, InlineNotification, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import classNames from 'classnames';
import { isWithinInterval } from 'date-fns';
import { useSHAEligibility } from '../hie.resource';
import { BillingConfig } from '../../config-schema';
import styles from './patient-banner-sha-status.scss';

interface PatientBannerShaStatusProps {
  patientUuid: string;
  renderedFrom: string;
}

const PatientBannerShaStatus: React.FC<PatientBannerShaStatusProps> = ({ patientUuid, renderedFrom }) => {
  const { t } = useTranslation();
  const { shaIdentificationNumberUUID } = useConfig<BillingConfig>();
  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);

  const shaIdentificationNumber = patient?.identifier?.filter((identifier) =>
    identifier?.type?.coding?.some((coding) => coding.code === shaIdentificationNumberUUID),
  );

  const { data, isLoading: isLoadingHIEEligibility, error } = useSHAEligibility(patientUuid, shaIdentificationNumber);

  const isRegisteredOnSHA = data?.status === 1;
  const isActive = isRegisteredOnSHA
    ? isWithinInterval(new Date(), {
        start: new Date(data?.coverageStartDate),
        end: new Date(data?.coverageEndDate),
      })
    : false;
  const civilServantScheme = data?.coverageType === 'CIVIL_SERVANT' && data?.status === 1;
  const hasCrNumber = !!data?.memberCrNumber && data.memberCrNumber.length > 0;

  const isPatientChart = renderedFrom === 'patient-chart';

  if (!isPatientChart) {
    return null;
  }

  if (isLoadingHIEEligibility || isLoadingPatient) {
    return <InlineLoading status="active" description={t('loading', 'Loading ...')} />;
  }

  if (error) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast
        statusIconDescription="notification"
        title={t('error', 'Error')}
        subtitle={t('errorRetrievingHIESubscription', 'Error retrieving HIE subscription')}
      />
    );
  }

  const renderStatusTag = (isActiveStatus: boolean) => (
    <Tag className={classNames(styles.tag, isActiveStatus ? styles.activeTag : styles.inactiveTag)}>
      {isActiveStatus ? t('active', 'Active') : t('inactive', 'Inactive')}
    </Tag>
  );

  const renderCivilServantTag = (isEligible: boolean) => (
    <Tag className={classNames(styles.tag, isEligible ? styles.activeTag : styles.inactiveTag)}>
      {isEligible ? t('eligible', 'Eligible') : t('notEligible', 'Not Eligible')}
    </Tag>
  );

  return (
    <div>
      <span className={styles.separator}>&middot;</span>
      <span>{t('phc', 'PHC')}</span>
      {renderStatusTag(isActive || hasCrNumber)}

      <span className={styles.separator}>&middot;</span>
      <span>{t('shif', 'SHIF')}</span>
      {renderStatusTag(isActive)}

      <span className={styles.separator}>&middot;</span>
      <span>{t('eccif', 'ECCIF')}</span>
      {renderStatusTag(isActive)}

      <span className={styles.separator}>&middot;</span>
      <span>{t('civilServantScheme', 'CIVIL SERVANT SCHEME')}</span>
      {renderCivilServantTag(civilServantScheme)}
    </div>
  );
};

export default PatientBannerShaStatus;
