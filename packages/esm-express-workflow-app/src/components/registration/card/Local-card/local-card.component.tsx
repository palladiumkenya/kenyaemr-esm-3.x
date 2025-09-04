import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { TwoFactorAuthentication, ChevronUp, ChevronDown } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../card.scss';
import DependentsComponent from '../../dependants/dependants.component';
import { LocalResponse, HIEBundleResponse } from '../../type';
import { convertLocalPatientToFHIR, hasDependents, getNationalIdFromPatient } from '../../helper';
import { PatientPhoto, launchWorkspace } from '@openmrs/esm-framework';
import { EnhancedPatientBannerPatientInfo } from '../../patient-banner/patient-banner.component';
import { useSHAEligibility } from '../../search-bar/search-bar.resource';
import { launchOtpVerificationModal } from '../../../../shared/otp-verification';
import { createOTPHandlers } from '../HIE-card/hie-card.resource';

interface LocalPatientCardProps {
  localSearchResults: LocalResponse;
  syncedPatients: Set<string>;
  searchedNationalId: string | null;
  otpExpiryMinutes?: number;
  hieSearchResults?: Array<HIEBundleResponse> | null; // Add HIE results for dependents fallback
}

const LocalPatientCard: React.FC<LocalPatientCardProps> = ({
  localSearchResults,
  syncedPatients,
  searchedNationalId,
  otpExpiryMinutes = 5,
  hieSearchResults = null,
}) => {
  const { t } = useTranslation();
  const { data: eligibilityResponse, isLoading: isEligibilityLoading } = useSHAEligibility(searchedNationalId);
  const [showDependentsForPatient, setShowDependentsForPatient] = useState<Set<string>>(new Set());
  const [verifiedPatients, setVerifiedPatients] = useState<Set<string>>(new Set());
  const [otpRequestedFor, setOtpRequestedFor] = useState<Set<string>>(new Set());

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

  // Helper function to find HIE patient with matching National ID
  const findHIEPatientByNationalId = (nationalId: string) => {
    if (!hieSearchResults) {
      return null;
    }

    for (const bundle of hieSearchResults) {
      if (bundle.entry) {
        for (const entry of bundle.entry) {
          const hieNationalId = getNationalIdFromPatient(entry.resource);
          if (hieNationalId === nationalId) {
            return entry.resource;
          }
        }
      }
    }
    return null;
  };

  // Helper function to check if patient has dependents (local or HIE)
  const patientHasDependentsEnhanced = (localPatient: any, fhirPatient: any): boolean => {
    // First check if local FHIR patient has dependents
    const localHasDependents = hasDependents(fhirPatient);
    if (localHasDependents) {
      return true;
    }

    // If no local dependents, check HIE patient for dependents
    const nationalId = getNationalIdFromPatient(fhirPatient);
    if (nationalId && hieSearchResults) {
      const hiePatient = findHIEPatientByNationalId(nationalId);
      if (hiePatient) {
        return hasDependents(hiePatient);
      }
    }

    return false;
  };

  // Helper function to get the appropriate patient for dependents display
  const getPatientForDependents = (localPatient: any, fhirPatient: any) => {
    // Check if local patient has dependents
    const localHasDependents = hasDependents(fhirPatient);
    if (localHasDependents) {
      return fhirPatient; // Use local patient data
    }

    // If no local dependents, try to get HIE patient
    const nationalId = getNationalIdFromPatient(fhirPatient);
    if (nationalId && hieSearchResults) {
      const hiePatient = findHIEPatientByNationalId(nationalId);
      if (hiePatient && hasDependents(hiePatient)) {
        return hiePatient; // Use HIE patient data for dependents
      }
    }

    return fhirPatient; // Fallback to local patient
  };

  // Helper function to extract phone number from local patient data
  const getPatientPhoneNumber = (patient: any): string => {
    // For local patients, check attributes for phone number
    const phoneAttribute = patient.attributes?.find(
      (attr: any) =>
        attr.attributeType?.display?.toLowerCase().includes('phone') ||
        attr.attributeType?.display?.toLowerCase().includes('mobile') ||
        attr.attributeType?.display?.toLowerCase().includes('telephone'),
    );

    if (phoneAttribute?.value) {
      return phoneAttribute.value;
    }

    // Fallback phone number
    return '254700000000';
  };

  const handleOTPRequest = (patientUuid: string) => {
    setOtpRequestedFor((prev) => new Set(prev).add(patientUuid));
  };

  const handleOTPVerificationSuccess = (patientId: string) => {
    setVerifiedPatients((prev) => new Set(prev).add(patientId));
    setOtpRequestedFor((prev) => {
      const newSet = new Set(prev);
      newSet.delete(patientId);
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

        // Enhanced dependents check that includes HIE fallback
        const patientHasDependentsResult = patientHasDependentsEnhanced(patient, fhirPatient);
        const patientForDependents = getPatientForDependents(patient, fhirPatient);

        const isVerified = verifiedPatients.has(patientUuid);
        const otpRequested = otpRequestedFor.has(patientUuid);

        // Get patient's phone number
        const patientPhoneNumber = getPatientPhoneNumber(patient);

        // Create OTP handlers
        const { onRequestOtp, onVerify } = createOTPHandlers(patientName, patientPhoneNumber, otpExpiryMinutes);

        return (
          <div
            key={patientKey}
            className={classNames(styles.container, {
              [styles.verifiedPatient]: isVerified,
            })}
            role="banner">
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
                {!isVerified && !otpRequested && (
                  <Button
                    kind="primary"
                    size="sm"
                    renderIcon={TwoFactorAuthentication}
                    onClick={() => {
                      handleOTPRequest(patientUuid);
                      launchOtpVerificationModal({
                        otpLength: 5,
                        obscureText: false,
                        phoneNumber: patientPhoneNumber,
                        expiryMinutes: otpExpiryMinutes,
                        onRequestOtp,
                        onVerify,
                        onVerificationSuccess: () => handleOTPVerificationSuccess(patientUuid),
                      });
                    }}>
                    {t('sendOtp', 'Send OTP')}
                  </Button>
                )}

                {otpRequested && !isVerified && (
                  <div className={styles.otpInProgress}>
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => {
                        launchOtpVerificationModal({
                          otpLength: 5,
                          obscureText: false,
                          phoneNumber: patientPhoneNumber,
                          expiryMinutes: otpExpiryMinutes,
                          onRequestOtp,
                          onVerify,
                          onVerificationSuccess: () => handleOTPVerificationSuccess(patientUuid),
                        });
                      }}>
                      {t('enterOtp', 'Enter OTP')}
                    </Button>
                  </div>
                )}

                {isVerified && (
                  <Button
                    kind="secondary"
                    size="sm"
                    onClick={() => {
                      launchWorkspace('start-visit-workspace-form', {
                        patientUuid: patient.uuid,
                        workspaceTitle: t('startVisitWorkspaceTitle', 'Start Visit for {{patientName}}', {
                          patientName: patientUuid,
                        }),
                      });
                    }}>
                    {t('checkInForm', 'Check In')}
                  </Button>
                )}

                {isVerified && patientHasDependentsResult && (
                  <Button
                    iconDescription={showDependents ? 'Hide dependents' : 'Show dependents'}
                    kind="tertiary"
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
                  <DependentsComponent patient={patientForDependents} />
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
