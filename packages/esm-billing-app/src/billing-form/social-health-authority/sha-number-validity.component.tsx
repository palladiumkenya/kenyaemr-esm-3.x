import { ActionableNotification, Form, InlineLoading, InlineNotification } from '@carbon/react';
import { navigate, useConfig, usePatient } from '@openmrs/esm-framework';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BillingConfig } from '../../config-schema';
import { useHIESubscription } from '../hie.resource';
import styles from './sha-number-validity.scss';

type SHANumberValidityProps = {
  paymentMethod: any;
  patientUuid: string;
};

const SHANumberValidity: React.FC<SHANumberValidityProps> = ({ paymentMethod, patientUuid }) => {
  const { t } = useTranslation();
  const { nationalPatientUniqueIdentifierTypeUuid } = useConfig<BillingConfig>();
  const { patient, isLoading } = usePatient(patientUuid);
  const { watch } = useFormContext();
  const isSHA = watch('insuranceScheme')?.includes('SHA');
  const { data, isLoading: isLoadingHIE, error } = useHIESubscription(patientUuid);

  const nationalUniquePatientIdentifier = patient?.identifier
    ?.filter((identifier) => identifier)
    .filter((identifier) =>
      identifier.type.coding.some((coding) => coding.code === nationalPatientUniqueIdentifierTypeUuid),
    );

  if (!isSHA) {
    return null;
  }

  if (isLoadingHIE || isLoading) {
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

  if (nationalUniquePatientIdentifier?.length === 0) {
    return (
      <InlineNotification
        aria-label="closes notification"
        kind="error"
        lowContrast={true}
        statusIconDescription="notification"
        title={t('patientMissingUniqueIdentifierTitle', 'Patient missing NUPI')}
        subtitle={t(
          'patientMissingUniqueIdentifier',
          'Patient is missing National unique patient identifier, SHA validation cannot be done, Advise patient to visit registration desk',
        )}
      />
    );
  }

  if (data[0].eligibility_response.message.eligible === 0) {
    return (
      <ActionableNotification
        title={t('pendingHIEVerification', 'Pending HIE verification')}
        subtitle={t('pendingVerificationReason', data[0].eligibility_response.message.reason)}
        closeOnEscape
        inline={false}
        actionButtonLabel={t('verify', 'Verify')}
        onActionButtonClick={() => {
          navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/edit` });
        }}
        className={styles.missingCRNumber}
      />
    );
  }

  return (
    <Form className={styles.formContainer}>
      {/* {hieSubscriptions?.map(({ inforce, insurer, start, end }, index) => {
        return (
          <div key={`${index}${insurer}`} className={styles.hieCard}>
            <div className={Boolean(inforce) ? styles.hieCardItemActive : styles.hieCardItemInActive}>
              <span className={styles.hieInsurerTitle}>{t('insurer', 'Insurer:')}</span>{' '}
              <span className={styles.hieInsurerValue}>{capitalize(insurer)}</span>
              {start && end && (
                <Tooltip
                  className={styles.tooltip}
                  align="bottom"
                  label={`Active from ${formatDate(new Date(start))} to ${formatDate(new Date(end))}`}>
                  <button className="sb-tooltip-trigger" type="button">
                    <Information />
                  </button>
                </Tooltip>
              )}
            </div>
            <div className={Boolean(inforce) ? styles.hieCardItemActive : styles.hieCardItemInActive}>
              <CheckboxCheckedFilled />
              <span className={Boolean(inforce) ? styles.activeSubscription : styles.inActiveSubscription}>
                {inforce ? t('active', 'Active') : t('inactive', 'Inactive')}
              </span>
            </div>
          </div>
        );
      })} */}
    </Form>
  );
};

export default SHANumberValidity;
