import { ActionableNotification, Form, InlineLoading, InlineNotification, Tooltip } from '@carbon/react';
import { CheckboxCheckedFilled, Information } from '@carbon/react/icons';
import { formatDate, navigate, useConfig, usePatient } from '@openmrs/esm-framework';
import { isWithinInterval, parseISO } from 'date-fns';
import React, { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BillingConfig } from '../../config-schema';
import { type Scheme, useSHAEligibility } from '../hie.resource';
import styles from './sha-number-validity.scss';

type SHANumberValidityProps = {
  paymentMethod: any;
  patientUuid: string;
};

const SHANumberValidity: React.FC<SHANumberValidityProps> = ({ paymentMethod, patientUuid }) => {
  const { t } = useTranslation();
  const { shaIdentificationNumberUUID } = useConfig<BillingConfig>();
  const { patient, isLoading: isLoadingPatientUuid } = usePatient(patientUuid);
  const { watch } = useFormContext();
  const isSHA = watch('insuranceScheme')?.includes('SHA');
  const shaIdentificationNumber = patient?.identifier
    ?.filter((identifier) => identifier)
    .filter((identifier) => identifier.type.coding.some((coding) => coding.code === shaIdentificationNumberUUID));

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

  const getSchemeEligibility = (
    schemes: Scheme[],
    schemeName: string,
  ): { eligible: boolean; scheme: Scheme | null } => {
    const schemeMatches = schemes.filter((s) => s.schemeName.toUpperCase() === schemeName.toUpperCase());

    if (schemeMatches.length === 0) {
      return { eligible: false, scheme: null };
    }

    const primaryScheme = schemeMatches.find((s) => s.memberType === 'PRIMARY');
    if (primaryScheme && isSchemeEligibleAndActive(primaryScheme)) {
      return { eligible: true, scheme: primaryScheme };
    }

    const beneficiaryScheme = schemeMatches.find((s) => s.memberType === 'BENEFICIARY');
    if (beneficiaryScheme && isSchemeEligibleAndActive(beneficiaryScheme)) {
      return { eligible: true, scheme: beneficiaryScheme };
    }

    return { eligible: false, scheme: schemeMatches[0] };
  };

  const eligibilityInfo = useMemo(() => {
    if (!data?.schemes || data.schemes.length === 0) {
      return {
        isRegisteredOnSHA: false,
        hasCrNumber: false,
        isActive: false,
        activeSchemes: [],
        coverageStartDate: null,
        coverageEndDate: null,
        message: data?.statusDesc || '',
      };
    }

    const uhc = getSchemeEligibility(data.schemes, 'UHC');
    const shif = getSchemeEligibility(data.schemes, 'SHIF');
    const tsc = getSchemeEligibility(data.schemes, 'TSC');
    const pomsf = getSchemeEligibility(data.schemes, 'POMSF');

    const activeSchemes = [];
    if (uhc.eligible) {
      activeSchemes.push('PHC');
    }
    if (shif.eligible) {
      activeSchemes.push('SHIF');
    }
    if (tsc.eligible) {
      activeSchemes.push('TSC');
    }
    if (pomsf.eligible) {
      activeSchemes.push('POMSF');
    }

    const activeSchemesList = [uhc.scheme, shif.scheme, tsc.scheme, pomsf.scheme].filter(
      (s) => s && isSchemeEligibleAndActive(s),
    );

    let coverageStartDate = null;
    let coverageEndDate = null;

    if (activeSchemesList.length > 0) {
      const startDates = activeSchemesList.map((s) => parseISO(s.coverage.startDate));
      const endDates = activeSchemesList.map((s) => parseISO(s.coverage.endDate));
      coverageStartDate = new Date(Math.min(...startDates.map((d) => d.getTime())));
      coverageEndDate = new Date(Math.max(...endDates.map((d) => d.getTime())));
    }

    const hasCrNumber = !!data.memberCrNumber && data.memberCrNumber.length > 0;
    const isActive = activeSchemes.length > 0;
    const isRegisteredOnSHA = data.statusCode === '10'; // Member found

    return {
      isRegisteredOnSHA,
      hasCrNumber,
      isActive,
      activeSchemes,
      coverageStartDate,
      coverageEndDate,
      message: data.statusDesc || '',
    };
  }, [data]);

  if (!isSHA) {
    return null;
  }

  if (shaIdentificationNumber?.length === 0) {
    return (
      <ActionableNotification
        title={t('patientMissingSHAId', 'Patient missing SHA identification number')}
        subtitle={t(
          'patientMissingSHANumber',
          'Patient is missing SHA number, SHA validation cannot be done, Advise patient to visit registration desk',
        )}
        closeOnEscape
        inline={false}
        actionButtonLabel={t('updateRegistration', 'Update registration')}
        className={styles.missingSHANumber}
        onActionButtonClick={() => {
          navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/edit` });
        }}
      />
    );
  }

  if (isLoadingHIEEligibility || isLoadingPatientUuid) {
    return <InlineLoading status="active" description={t('loading', 'Loading ...')} />;
  }

  if (error) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        title={t('error', 'Error')}
        subtitle={t('errorRetrievingHIESubscription', 'Error retrieving HIE subscription')}
      />
    );
  }

  if (!eligibilityInfo.hasCrNumber) {
    return (
      <InlineNotification
        title={t('hieVerificationFailure', 'HIE verification failure')}
        subtitle={eligibilityInfo.message}
        className={styles.missingSHANumber}
      />
    );
  }

  const renderSchemeCard = (schemeValue: string, cardClass: string) => (
    <Form className={styles.formContainer}>
      <div className={cardClass}>
        <div className={eligibilityInfo.isActive ? styles.hieCardItemActive : styles.hieCardItemInActive}>
          <span className={styles.hieInsurerTitle}>
            {eligibilityInfo.isActive ? t('activeSchemes', 'Active Schemes:') : t('scheme', 'Scheme:')}
          </span>{' '}
          <span className={styles.hieInsurerValue}>{schemeValue}</span>
          {eligibilityInfo.isActive && eligibilityInfo.coverageStartDate && (
            <Tooltip
              className={styles.tooltip}
              align="bottom"
              label={`${t('activeFrom', 'Active from')} ${formatDate(eligibilityInfo.coverageStartDate)}`}>
              <button className="sb-tooltip-trigger" type="button">
                <Information />
              </button>
            </Tooltip>
          )}
        </div>
        <div className={eligibilityInfo.isActive ? styles.hieCardItemActive : styles.hieCardItemInActive}>
          <CheckboxCheckedFilled />
          <span className={eligibilityInfo.isActive ? styles.activeSubscription : styles.inActiveSubscription}>
            {eligibilityInfo.isActive ? t('active', 'Active') : t('inactive', 'Inactive')}
          </span>
        </div>
      </div>
    </Form>
  );

  if (eligibilityInfo.hasCrNumber) {
    if (eligibilityInfo.isRegisteredOnSHA && eligibilityInfo.activeSchemes.length > 0) {
      const schemeValue = eligibilityInfo.activeSchemes.join(' | ');
      return renderSchemeCard(schemeValue, styles.hieCard);
    } else {
      return renderSchemeCard('PHC', styles.hieCardPHC);
    }
  }

  return null;
};

export default SHANumberValidity;
