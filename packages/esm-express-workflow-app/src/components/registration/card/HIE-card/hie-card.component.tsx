import React, { useState } from 'react';
import { Button } from '@carbon/react';
import { TwoFactorAuthentication, ChevronUp, ChevronDown } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../card.scss';
import DependentsComponent from '../../dependants/dependants.component';
import { LocalResponse, type HIEBundleResponse } from '../../type';
import { convertLocalPatientToFHIR, hasDependents } from '../../helper';
import { launchWorkspace, PatientPhoto } from '@openmrs/esm-framework';
import { EnhancedPatientBannerPatientInfo } from '../../patient-banner/patient-banner.component';
import { useSHAEligibility } from '../../search-bar/search-bar.resource';
import { launchOtpVerificationModal } from '../../../../shared/otp-verification';
import { createOTPHandlers } from './hie-card.resource';
import { createHIEPatient } from '../../hook/useCreatePatient';

interface HIEDisplayCardProps {
  bundle: HIEBundleResponse;
  bundleIndex: number;
  searchedNationalId: string | null;
  otpExpiryMinutes?: number;
  localSearchResults?: LocalResponse | null;
}

const HIEDisplayCard: React.FC<HIEDisplayCardProps> = ({
  bundle,
  bundleIndex,
  searchedNationalId,
  otpExpiryMinutes = 5,
  localSearchResults = null,
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

  // Helper function to extract phone number from patient data
  const getPatientPhoneNumber = (patient: any): string => {
    // Look for phone number in patient telecom
    const phoneContact = patient.telecom?.find(
      (contact: any) => contact.system === 'phone' || contact.use === 'mobile',
    );

    if (phoneContact?.value) {
      return phoneContact.value;
    }

    // For local patients, check attributes for phone number
    if (localSearchResults) {
      const localPatient = localSearchResults.find((local) => local.uuid === patient.id);
      if (localPatient) {
        const phoneAttribute = localPatient.attributes?.find(
          (attr: any) =>
            attr.attributeType?.display?.toLowerCase().includes('phone') ||
            attr.attributeType?.display?.toLowerCase().includes('mobile') ||
            attr.attributeType?.display?.toLowerCase().includes('telephone'),
        );
        if (phoneAttribute?.value) {
          return phoneAttribute.value;
        }
      }
    }

    return '254700000000'; // Fallback phone number
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

  if (!bundle.entry || bundle.entry.length === 0) {
    return null;
  }

  return (
    <>
      {bundle.entry.map((entry, entryIndex) => {
        const patient = entry.resource;
        const patientName =
          patient.name?.[0]?.text ||
          `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`.trim() ||
          'Unknown Patient';
        const patientUuid = patient.id;
        const patientKey = `${bundleIndex}-${entryIndex}`;
        const showDependents = showDependentsForPatient.has(patientKey);
        const patientHasDependents = hasDependents(patient);
        const isVerified = verifiedPatients.has(patientUuid);
        const otpRequested = otpRequestedFor.has(patientUuid);

        // Check if this patient exists locally by comparing UUIDs
        const hasLocal =
          localSearchResults && localSearchResults.some((localPatient) => localPatient.uuid === patientUuid);

        // Get patient's phone number
        const patientPhoneNumber = getPatientPhoneNumber(patient);

        // Create OTP handlers using your OTP management service with configurable expiry
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
                patient={patient}
                renderedFrom="hie-search"
                eligibilityData={eligibilityResponse || undefined}
                isEligibilityLoading={isEligibilityLoading}
              />
            </div>

            <div className={styles.buttonCol}>
              <div className={styles.actionButtons}>
                {/* Show Send OTP button for ALL patients (local and HIE) when not verified */}
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

                {/* Show Enter OTP button when OTP is requested but not verified */}
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
                    onClick={async () => {
                      if (hasLocal) {
                        const localPatient = localSearchResults?.find((local) => local.uuid === patientUuid);
                        const localPatientName =
                          localPatient?.person?.personName?.display ||
                          `${localPatient?.person?.personName?.givenName || ''} ${
                            localPatient?.person?.personName?.middleName || ''
                          } ${localPatient?.person?.personName?.familyName || ''}`.trim() ||
                          patientName;

                        launchWorkspace('start-visit-workspace-form', {
                          patientUuid: localPatient?.uuid || patientUuid,
                          workspaceTitle: t('startVisitWorkspaceTitle', 'Start Visit for {{patientName}}', {
                            patientName: localPatientName,
                          }),
                        });
                      } else {
                        try {
                          await createHIEPatient(patient, t);
                        } catch (error) {
                          console.error('Failed to register HIE patient:', error);
                        }
                      }
                    }}>
                    {hasLocal ? t('startVisit', 'Start Visit') : t('registerAndStartVisit', 'Register & Start Visit')}
                  </Button>
                )}

                {patientHasDependents && isVerified && (
                  <>
                    <pre>{patientHasDependents}</pre>
                    <Button
                      iconDescription={showDependents ? 'Hide dependents' : 'Show dependents'}
                      kind="tertiary"
                      size="sm"
                      onClick={() => toggleDependentsVisibility(patientKey)}
                      renderIcon={showDependents ? ChevronUp : ChevronDown}>
                      {showDependents ? t('showLess', 'Show less') : t('showDependents', 'Show dependents')}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {showDependents && (
              <div className={styles.dependentsSection}>
                <div className={styles.dependentsContainer}>
                  <DependentsComponent patient={patient} />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default HIEDisplayCard;
