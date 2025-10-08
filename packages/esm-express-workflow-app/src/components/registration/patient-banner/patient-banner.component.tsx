import React, { useMemo } from 'react';
import classNames from 'classnames';
import { getCoreTranslation } from '@openmrs/esm-translations';
import { GenderFemale, GenderMale } from '@carbon/react/icons';
import { age, ExtensionSlot, formatDate, getPatientName, parseDate } from '@openmrs/esm-framework';
import styles from './patient-banner.scss';
import { Tag } from '@carbon/react';
import { EligibilityResponse } from '../type';
import { getEligibilityTags, maskName } from '../helper';
import { useTranslation } from 'react-i18next';

interface EnhancedPatientBannerPatientInfoProps {
  patient: fhir.Patient;
  hiePatient?: fhir.Patient;
  renderedFrom?: string;
  showSyncButton?: boolean;
  onSyncSuccess?: (patientUuid: string) => void;
  eligibilityData?: EligibilityResponse;
  isEligibilityLoading?: boolean;
}

type Gender = 'female' | 'male';

const GENDER_ICONS = {
  Female: <GenderFemale />,
  Male: <GenderMale />,
} as const;

const GENDER_MAP: Record<string, 'Male' | 'Female'> = {
  male: 'Male',
  female: 'Female',
  m: 'Male',
  f: 'Female',
};

const getGender = (gender: string) => {
  const normalizedGender = gender.toLowerCase();
  const iconKey = GENDER_MAP[normalizedGender] ?? 'Unknown';

  return {
    displayText: iconKey,
    iconKey,
  };
};

const getSHANumber = (identifiers: fhir.Identifier[] | undefined): string => {
  if (!identifiers?.length) {
    return '--';
  }

  const shaIdentifier = identifiers.find(
    (identifier) =>
      identifier.type?.coding?.[0]?.code === 'sha-number' || identifier.type?.coding?.[0]?.display === 'SHA Number',
  );

  return shaIdentifier?.value || '--';
};

export const EnhancedPatientBannerPatientInfo: React.FC<EnhancedPatientBannerPatientInfoProps> = ({
  patient,
  renderedFrom,
  eligibilityData,
  isEligibilityLoading,
}) => {
  const { t } = useTranslation();
  const name = getPatientName(patient);
  const genderInfo = patient?.gender && getGender(patient.gender);
  const shaNumber = useMemo(() => getSHANumber(patient.identifier), [patient.identifier]);

  const extensionState = useMemo(
    () => ({ patientUuid: patient.id, patient, renderedFrom }),
    [patient.id, patient, renderedFrom],
  );

  const eligibilityTags = useMemo(() => {
    if (isEligibilityLoading) {
      return [];
    }
    return getEligibilityTags(patient, eligibilityData);
  }, [patient, eligibilityData, isEligibilityLoading]);

  return (
    <div className={styles.patientInfo}>
      <div className={classNames(styles.row, styles.patientNameRow)}>
        <div className={styles.flexRow}>
          <span className={styles.patientName}>{maskName(name)}</span>

          {genderInfo && (
            <div className={styles.gender}>
              {GENDER_ICONS[genderInfo.iconKey as keyof typeof GENDER_ICONS]}
              <span>{genderInfo.displayText}</span>
            </div>
          )}

          <ExtensionSlot className={styles.tagsSlot} name="patient-banner-tags-slot" state={extensionState} />

          <div className={styles.eligibilityTags}>
            {isEligibilityLoading ? (
              <Tag type="blue" size="md">
                {t('checkingEligibility', 'Checking eligibility' + '...')}
              </Tag>
            ) : (
              eligibilityTags.map((tag, index) => (
                <Tag key={index} type={tag.type} size="md" title={tag.text}>
                  {tag.text}
                </Tag>
              ))
            )}
          </div>
        </div>
      </div>
      <div className={styles.demographics}>
        {patient.birthDate && (
          <>
            <span>{age(patient.birthDate)}</span>
            <span className={styles.separator}>&middot;</span>
            <span>{formatDate(parseDate(patient.birthDate))}</span>
            <span className={styles.separator}>&middot;</span>
          </>
        )}
        <div>
          <div className={styles.identifiers}>{shaNumber}</div>
        </div>
        <ExtensionSlot className={styles.extensionSlot} name="patient-banner-bottom-slot" state={extensionState} />
      </div>
    </div>
  );
};
