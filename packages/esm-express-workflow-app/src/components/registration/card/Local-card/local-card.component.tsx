import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { TwoFactorAuthentication, ChevronUp, ChevronDown } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../../styling/global.scss';
import DependentsComponent from '../../dependants/dependants.component';
import { LocalResponse } from '../../type';
import { convertLocalPatientToFHIR, hasDependents } from '../../helper';
import { PatientPhoto } from '@openmrs/esm-framework';
import { EnhancedPatientBannerPatientInfo } from '../../patient-banner/patient-banner.component';
import { useSHAEligibility } from '../../search-bar/search-bar.resource';

interface LocalPatientCardProps {
  localSearchResults: LocalResponse;
  syncedPatients: Set<string>;
  searchedNationalId: string | null;
}

const LocalPatientCard: React.FC<LocalPatientCardProps> = ({
  localSearchResults,
  syncedPatients,
  searchedNationalId,
}) => {
  const { t } = useTranslation();
  const { data: eligibilityResponse, isLoading: isEligibilityLoading } = useSHAEligibility(searchedNationalId);
  const [showDependentsForPatient, setShowDependentsForPatient] = useState<Set<string>>(new Set());

  const toggleDependentsVisibility = (patientId: string) => {
    setShowDependentsForPatient((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  if (!localSearchResults || !Array.isArray(localSearchResults) || localSearchResults.length === 0) {
    return null;
  }

  const filteredPatients = localSearchResults.filter((patient) => {
    const fhirPatient = convertLocalPatientToFHIR(patient);
    return !syncedPatients.has(fhirPatient.id);
  });

  if (filteredPatients.length === 0) {
    return null;
  }

  return (
    <>
      {filteredPatients.map((patient, entryIndex) => {
        const fhirPatient = convertLocalPatientToFHIR(patient);
        const patientUuid = patient.uuid || fhirPatient.id;
        const patientName =
          patient.person?.personName?.display ||
          `${patient.person?.personName?.givenName || ''} ${patient.person?.personName?.middleName || ''} ${
            patient.person?.personName?.familyName || ''
          }`.trim() ||
          'Unknown Patient';

        const patientKey = `local-patient-${entryIndex}`;
        const showDependents = showDependentsForPatient.has(patientKey);
        const patientHasDependents = hasDependents(fhirPatient);
        const needsRegistration = true;

        return (
          <div key={patientKey} className={classNames(styles.container)} role="banner">
            <div className={styles.patientInfo}>
              <div className={styles.patientAvatar} role="img">
                <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
              </div>

              <EnhancedPatientBannerPatientInfo
                patient={fhirPatient}
                renderedFrom="local-search"
                eligibilityData={eligibilityResponse || undefined}
                isEligibilityLoading={isEligibilityLoading}
              />
            </div>

            <div className={styles.buttonCol}>
              <div className={styles.actionButtons}>
                {needsRegistration && (
                  <Button
                    kind="primary"
                    size="sm"
                    renderIcon={TwoFactorAuthentication}
                    onClick={() => {
                      console.log('Sending OTP for patient registration:', fhirPatient.id);
                    }}>
                    {t('sendOtp', 'Send OTP')}
                  </Button>
                )}

                {patientHasDependents && (
                  <Button
                    iconDescription={showDependents ? 'Hide dependents' : 'Show dependents'}
                    kind="secondary"
                    size="sm"
                    onClick={() => toggleDependentsVisibility(patientKey)}
                    renderIcon={showDependents ? ChevronUp : ChevronDown}>
                    {showDependents ? t('showLess', 'Show less') : t('showDependents', 'Show dependents')}
                  </Button>
                )}
              </div>
            </div>

            {showDependents && (
              <div className={styles.dependentsSection}>
                <div className={styles.dependentsContainer}>
                  <DependentsComponent patient={fhirPatient} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default LocalPatientCard;
