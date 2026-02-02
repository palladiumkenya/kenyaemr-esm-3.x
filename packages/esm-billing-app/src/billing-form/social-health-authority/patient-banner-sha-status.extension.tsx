import React, { useMemo } from 'react';
import { InlineLoading, InlineNotification, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import classNames from 'classnames';
import { isWithinInterval, parseISO, format } from 'date-fns';
import { Scheme, useSHAEligibility } from '../hie.resource';
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
    identifier?.type?.coding?.some((coding) => coding?.code === shaIdentificationNumberUUID),
  );

  const { data, isLoading: isLoadingHIEEligibility, error } = useSHAEligibility(patientUuid, shaIdentificationNumber);

  const isSchemeEligibleAndActive = (scheme: Scheme): boolean => {
    if (!scheme?.coverage) {
      return false;
    }

    if (scheme.coverage.status !== '1') {
      return false;
    }

    try {
      const now = new Date();
      const startDate = parseISO(scheme.coverage.startDate);
      const endDate = parseISO(scheme.coverage.endDate);
      return isWithinInterval(now, { start: startDate, end: endDate });
    } catch (error) {
      console.error('Error parsing dates:', error);
      return false;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getSchemeDisplayInfo = (
    schemes: Scheme[],
    schemeName: string,
  ): { scheme: Scheme | null; eligible: boolean; memberType: string } => {
    const schemeMatches = schemes.filter((s) => s.schemeName.toUpperCase() === schemeName.toUpperCase());

    if (schemeMatches.length === 0) {
      return { scheme: null, eligible: false, memberType: 'N/A' };
    }

    const primaryScheme = schemeMatches.find((s) => s.memberType === 'PRIMARY');
    if (primaryScheme && isSchemeEligibleAndActive(primaryScheme)) {
      return { scheme: primaryScheme, eligible: true, memberType: 'Primary' };
    }

    const beneficiaryScheme = schemeMatches.find((s) => s.memberType === 'BENEFICIARY');
    if (beneficiaryScheme && isSchemeEligibleAndActive(beneficiaryScheme)) {
      return { scheme: beneficiaryScheme, eligible: true, memberType: 'Beneficiary' };
    }

    return { scheme: schemeMatches[0], eligible: false, memberType: 'N/A' };
  };

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

    const uhc = getSchemeDisplayInfo(data.schemes, 'UHC');
    const shif = getSchemeDisplayInfo(data.schemes, 'SHIF');
    const tsc = getSchemeDisplayInfo(data.schemes, 'TSC');
    const pomsf = getSchemeDisplayInfo(data.schemes, 'POMSF');

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

  if (!data || data.statusCode !== '10') {
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

  const renderSchemeTag = (
    schemeInfo: { scheme: Scheme; eligible: boolean; memberType: string } | null,
    displayName: string,
  ) => {
    if (!schemeInfo || !schemeInfo.scheme) {
      return null;
    }

    const { scheme, eligible, memberType } = schemeInfo;
    const status = eligible ? t('eligible', 'Eligible') : t('notEligible', 'Not Eligible');
    const endDate = scheme.coverage?.endDate ? formatDate(scheme.coverage.endDate) : 'N/A';

    const tagText = `${displayName} | ${status} | ${endDate} | ${memberType}`;

    return (
      <Tag className={classNames(styles.tag, eligible ? styles.activeTag : styles.inactiveTag)} title={tagText}>
        {tagText}
      </Tag>
    );
  };

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
          {renderSchemeTag(schemesData.uhc, 'UHC')}
        </>
      )}

      {schemesData.shif && (
        <>
          <span className={styles.separator}>&middot;</span>
          {renderSchemeTag(schemesData.shif, 'SHIF')}
        </>
      )}

      {schemesData.tsc && (
        <>
          <span className={styles.separator}>&middot;</span>
          {renderSchemeTag(schemesData.tsc, 'TSC')}
        </>
      )}

      {schemesData.pomsf && (
        <>
          <span className={styles.separator}>&middot;</span>
          {renderSchemeTag(schemesData.pomsf, 'POMSF')}
        </>
      )}
    </div>
  );
};

export default PatientBannerShaStatus;
