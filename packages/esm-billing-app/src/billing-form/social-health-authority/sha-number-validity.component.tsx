import { ActionableNotification, Form, InlineLoading, InlineNotification, Tooltip } from '@carbon/react';
import { CheckboxCheckedFilled, Information } from '@carbon/react/icons';
import { formatDate, navigate, useConfig, usePatient } from '@openmrs/esm-framework';
import { isWithinInterval } from 'date-fns';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BillingConfig } from '../../config-schema';
import { useSHAEligibility } from '../hie.resource';
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

  const isRegisteredOnSHA = data?.status === 1;

  const isActive = isRegisteredOnSHA
    ? isWithinInterval(new Date(), {
        start: new Date(data?.coverageStartDate),
        end: new Date(data?.coverageEndDate),
      })
    : false;

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

  if (!isRegisteredOnSHA) {
    return (
      <InlineNotification
        title={t('hieVerificationFailure', 'HIE verification failure')}
        subtitle={`${data?.message ?? ''}.${data?.possibleSolution ?? ''}`}
        className={styles.missingSHANumber}
      />
    );
  }

  if (isRegisteredOnSHA) {
    return (
      <Form className={styles.formContainer}>
        <div className={styles.hieCard}>
          <div className={isActive ? styles.hieCardItemActive : styles.hieCardItemInActive}>
            <span className={styles.hieInsurerTitle}>{t('insurer', 'Insurer:')}</span>{' '}
            <span className={styles.hieInsurerValue}>SHA</span>
            {isActive && (
              <Tooltip
                className={styles.tooltip}
                align="bottom"
                label={`Active from ${formatDate(new Date(data?.coverageStartDate))}`}>
                <button className="sb-tooltip-trigger" type="button">
                  <Information />
                </button>
              </Tooltip>
            )}
          </div>
          <div className={isActive ? styles.hieCardItemActive : styles.hieCardItemInActive}>
            <CheckboxCheckedFilled />
            <span className={isActive ? styles.activeSubscription : styles.inActiveSubscription}>
              {isActive ? t('active', 'Active') : t('inactive', 'Inactive')}
            </span>
          </div>
        </div>
      </Form>
    );
  }
};

export default SHANumberValidity;
