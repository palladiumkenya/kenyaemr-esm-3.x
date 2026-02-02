import React, { useMemo } from 'react';
import { InlineLoading, InlineNotification, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import classNames from 'classnames';
import { useSHAEligibility } from '../hie.resource';
import { BillingConfig } from '../../config-schema';
import styles from './patient-banner-sha-status.scss';
import { getSchemeEligibility } from './helper';
import { EligibilityStatusCode, SchemeName } from './constant';
import SchemeTag from './scheme-tag.component';

interface PatientBannerShaStatusProps {
  patientUuid: string;
  renderedFrom: string;
}

const PatientBannerShaStatus: React.FC<PatientBannerShaStatusProps> = ({ patientUuid, renderedFrom }) => {
  const { t } = useTranslation();
  const { shaIdentificationNumberUUID } = useConfig<BillingConfig>();
  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);

  const shaIdentificationNumber = patient?.identifier?.filter((identifier) =>
    identifier?.type?.coding?.some((coding) => coding?.code === shaIdentificationNumberUUID),
  );

  const { data, isLoading: isLoadingHIEEligibility, error } = useSHAEligibility(patientUuid, shaIdentificationNumber);

  const schemesData = useMemo(() => {
    if (!data?.schemes || data.schemes.length === 0) {
      return {
        uhc: null,
        shif: null,
        tsc: null,
        pomsf: null,
        hasCrNumber: false,
      };
    }

    const uhc = getSchemeEligibility(data.schemes, SchemeName.UHC);
    const shif = getSchemeEligibility(data.schemes, SchemeName.SHIF);
    const tsc = getSchemeEligibility(data.schemes, SchemeName.TSC);
    const pomsf = getSchemeEligibility(data.schemes, SchemeName.POMSF);

    return {
      uhc: uhc.scheme ? uhc : null,
      shif: shif.scheme ? shif : null,
      tsc: tsc.scheme ? tsc : null,
      pomsf: pomsf.scheme ? pomsf : null,
      hasCrNumber: !!data.memberCrNumber && data.memberCrNumber.length > 0,
    };
  }, [data]);

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

  if (!data || data.statusCode !== EligibilityStatusCode.MEMBER_FOUND) {
    return (
      <div>
        <span className={styles.separator}>&middot;</span>
        <Tag className={classNames(styles.tag, styles.inactiveTag)}>
          <span className={styles.schemeName}>{t('sha', 'SHA')}</span>
          <span>{t('notRegistered', 'Not Registered')}</span>
        </Tag>
      </div>
    );
  }

  if (!schemesData.uhc && !schemesData.shif && !schemesData.tsc && !schemesData.pomsf) {
    return (
      <div>
        <span className={styles.separator}>&middot;</span>
        <Tag className={classNames(styles.tag, styles.inactiveTag)}>
          <span className={styles.schemeName}>{t('sha', 'SHA')}</span>
          <span>{t('noSchemesFound', 'No Schemes Found')}</span>
        </Tag>
      </div>
    );
  }

  return (
    <div>
      {schemesData.uhc && (
        <>
          <span className={styles.separator}>&middot;</span>
          <SchemeTag schemeInfo={schemesData.uhc} displayName={SchemeName.UHC} />
        </>
      )}

      {schemesData.shif && (
        <>
          <span className={styles.separator}>&middot;</span>
          <SchemeTag schemeInfo={schemesData.shif} displayName={SchemeName.SHIF} />
        </>
      )}

      {schemesData.tsc && (
        <>
          <span className={styles.separator}>&middot;</span>
          <SchemeTag schemeInfo={schemesData.tsc} displayName={SchemeName.TSC} />
        </>
      )}

      {schemesData.pomsf && (
        <>
          <span className={styles.separator}>&middot;</span>
          <SchemeTag schemeInfo={schemesData.pomsf} displayName={SchemeName.POMSF} />
        </>
      )}
    </div>
  );
};

export default PatientBannerShaStatus;
