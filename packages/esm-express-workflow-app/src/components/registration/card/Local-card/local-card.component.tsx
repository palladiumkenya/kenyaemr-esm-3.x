import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@carbon/react';
import { TwoFactorAuthentication, ChevronUp, ChevronDown } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../card.scss';
import { LocalResponse, type HIEBundleResponse, type EligibilityResponse } from '../../type';
import { launchWorkspace, PatientPhoto, showModal, closeWorkspace, navigate } from '@openmrs/esm-framework';
import { EnhancedPatientBannerPatientInfo } from '../../patient-banner/patient-banner.component';
import { convertLocalPatientToFHIR, getNationalIdFromPatient, hasDependents } from '../../helper';
import { launchOtpVerificationModal } from '../../../../shared/otp-verification';
import DependentsComponent from '../../dependants/dependants.component';
import { useMultipleActiveVisits } from '../../dependants/dependants.resource';
import { otpManager, useOtpSource, cleanupAllOTPs } from '../HIE-card/hie-card.resource';
import { sanitizePhoneNumber } from '../../../../shared/utils';

interface LocalPatientCardProps {
  localSearchResults: LocalResponse;
  syncedPatients: Set<string>;
  searchedNationalId: string;
  otpExpiryMinutes?: number;
  hieSearchResults?: Array<HIEBundleResponse> | null;
  eligibilityResponse?: EligibilityResponse;
}

const LocalPatientCard: React.FC<LocalPatientCardProps> = ({
  localSearchResults,
  syncedPatients,
  searchedNationalId,
  otpExpiryMinutes = 5,
  hieSearchResults = null,
  eligibilityResponse,
}) => {
  const { t } = useTranslation();
  const [verifiedPatients, setVerifiedPatients] = useState<Set<string>>(new Set());
  const [otpRequestedFor, setOtpRequestedFor] = useState<Set<string>>(new Set());
  const [activePhoneNumbers, setActivePhoneNumbers] = useState<Map<string, string>>(new Map());
  const [showDependentsForPatient, setShowDependentsForPatient] = useState<Set<string>>(new Set());
  const { otpSource, isLoading: isLoadingOtpSource } = useOtpSource();

  useEffect(() => {
    if (otpSource) {
      otpManager.setOtpSource(otpSource);
    }
  }, [otpSource]);

  // Clean up OTPs when component unmounts
  useEffect(() => {
    return () => {
      cleanupAllOTPs();
    };
  }, []);

  const patientUuids = useMemo(() => {
    return localSearchResults?.map((patient) => patient.uuid) || [];
  }, [localSearchResults]);

  const visits = useMultipleActiveVisits(patientUuids);

  const findHIEPatientData = useCallback(
    (localPatient: any): any => {
      if (!hieSearchResults || !Array.isArray(hieSearchResults)) {
        return null;
      }

      const fhirPatient = convertLocalPatientToFHIR(localPatient);
      const localNationalId = getNationalIdFromPatient(fhirPatient);

      if (!localNationalId) {
        return null;
      }

      for (const bundle of hieSearchResults) {
        if (bundle.entry) {
          for (const entry of bundle.entry) {
            const hieNationalId = getNationalIdFromPatient(entry.resource);
            if (hieNationalId === localNationalId) {
              return entry.resource;
            }
          }
        }
      }
      return null;
    },
    [hieSearchResults],
  );

  const toggleDependentsVisibility = useCallback((patientUuid: string) => {
    setShowDependentsForPatient((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(patientUuid)) {
        newSet.delete(patientUuid);
      } else {
        newSet.add(patientUuid);
      }
      return newSet;
    });
  }, []);

  const getPatientPhoneNumber = useCallback((localPatient: any): string => {
    const phoneAttribute = localPatient.attributes?.find(
      (attr: any) =>
        attr.attributeType?.display?.toLowerCase().includes('phone') ||
        attr.attributeType?.display?.toLowerCase().includes('mobile') ||
        attr.attributeType?.display?.toLowerCase().includes('telephone'),
    );

    if (phoneAttribute?.value) {
      return sanitizePhoneNumber(phoneAttribute.value);
    }

    return '254700000000';
  }, []);

  const handleOTPRequest = useCallback((patientUuid: string) => {
    setOtpRequestedFor((prev) => new Set(prev).add(patientUuid));
  }, []);

  const handleOTPVerificationSuccess = useCallback((patientId: string) => {
    setVerifiedPatients((prev) => new Set(prev).add(patientId));
    setOtpRequestedFor((prev) => {
      const newSet = new Set(prev);
      newSet.delete(patientId);
      return newSet;
    });
    setActivePhoneNumbers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(patientId);
      return newMap;
    });
  }, []);

  const createDynamicOTPHandlers = useCallback(
    (patientUuid: string, patientName: string, phoneNumber: string) => {
      return {
        onRequestOtp: async (phone: string): Promise<void> => {
          const sanitizedPhone = sanitizePhoneNumber(phone);
          try {
            await otpManager.requestOTP(sanitizedPhone, patientName, otpExpiryMinutes, searchedNationalId);
          } catch (error) {
            throw error;
          }
        },
        onVerify: async (otp: string, _phoneNumber?: string): Promise<void> => {
          const sanitizedPhone = sanitizePhoneNumber(phoneNumber);
          try {
            const isValid = await otpManager.verifyOTP(sanitizedPhone, otp);
            if (!isValid) {
              throw new Error('OTP verification failed');
            }
          } catch (error) {
            throw error;
          }
        },
        cleanup: (): void => {
          otpManager.cleanupExpiredOTPs();
        },
      };
    },
    [otpExpiryMinutes, searchedNationalId],
  );

  const handleQueuePatient = useCallback((activeVisit: any, patientUuid: string) => {
    const dispose = showModal('transition-patient-to-latest-queue-modal', {
      closeModal: () => {
        navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` });
        dispose();
      },
      activeVisit,
    });
  }, []);

  if (!localSearchResults || localSearchResults.length === 0) {
    return null;
  }

  return (
    <>
      {localSearchResults.map((localPatient, index) => {
        const fhirPatient = convertLocalPatientToFHIR(localPatient);
        const patientName =
          localPatient?.person?.personName?.display ||
          `${localPatient?.person?.personName?.givenName || ''} ${localPatient?.person?.personName?.middleName || ''} ${
            localPatient?.person?.personName?.familyName || ''
          }`.trim() ||
          'Unknown Patient';

        const patientUuid = localPatient.uuid;
        const patientKey = `local-${index}`;
        const isVerified = verifiedPatients.has(patientUuid);
        const otpRequested = otpRequestedFor.has(patientUuid);

        const activeVisit = visits[index]?.activeVisit || null;
        const hasActiveVisit = !!activeVisit;

        const hiePatientData: any = findHIEPatientData(localPatient);

        const patientHasDependents: boolean = hiePatientData ? hasDependents(hiePatientData) : false;
        const showDependents: boolean = showDependentsForPatient.has(patientUuid);

        const patientPhoneNumber = getPatientPhoneNumber(localPatient);
        const { onRequestOtp, onVerify, cleanup } = createDynamicOTPHandlers(
          patientUuid,
          patientName,
          patientPhoneNumber,
        );

        return (
          <React.Fragment key={patientKey}>
            <div
              className={classNames(styles.container, styles.localPatient, {
                [styles.verifiedPatient]: isVerified,
                [styles.activeVisitPatient]: hasActiveVisit,
              })}
              role="banner">
              <div className={styles.patientInfo}>
                <div className={styles.patientAvatar} role="img">
                  <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
                </div>

                <EnhancedPatientBannerPatientInfo
                  patient={fhirPatient}
                  renderedFrom="local-search"
                  eligibilityData={eligibilityResponse}
                  isEligibilityLoading={false}
                  crNumber={hiePatientData?.id}
                />
              </div>

              <div className={styles.buttonCol}>
                <div className={styles.actionButtons}>
                  {!isVerified && !otpRequested && (
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={TwoFactorAuthentication}
                      disabled={isLoadingOtpSource}
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
                          onCleanup: cleanup,
                        });
                      }}>
                      {t('sendOtp', 'Send OTP')}
                    </Button>
                  )}

                  {otpRequested && !isVerified && (
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
                          onCleanup: cleanup,
                        });
                      }}>
                      {t('enterOtp', 'Enter OTP')}
                    </Button>
                  )}

                  {isVerified && (
                    <>
                      {!hasActiveVisit && (
                        <Button
                          kind="primary"
                          size="sm"
                          onClick={() => {
                            launchWorkspace('start-visit-workspace-form', {
                              patientUuid: patientUuid,
                              workspaceTitle: t('checkInPatientWorkspaceTitle', 'Check in patient'),
                              closeWorkspace: () => {
                                closeWorkspace('start-visit-workspace-form', {
                                  onWorkspaceClose: () => {
                                    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` });
                                  },
                                  ignoreChanges: true,
                                });
                              },
                              closeWorkspaceWithSavedChanges: () => {
                                closeWorkspace('start-visit-workspace-form', {
                                  onWorkspaceClose: () => {
                                    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` });
                                  },
                                  ignoreChanges: true,
                                });
                              },
                            });
                          }}>
                          {t('checkIn', 'Check In')}
                        </Button>
                      )}

                      {hasActiveVisit && (
                        <Button kind="secondary" size="sm" onClick={() => handleQueuePatient(activeVisit, patientUuid)}>
                          {t('queuePatient', 'Queue Patient')}
                        </Button>
                      )}

                      {patientHasDependents && hiePatientData && (
                        <Button
                          iconDescription={showDependents ? 'Hide dependents' : 'Show dependents'}
                          kind="tertiary"
                          size="sm"
                          onClick={() => toggleDependentsVisibility(patientUuid)}
                          renderIcon={showDependents ? ChevronUp : ChevronDown}>
                          {showDependents
                            ? t('hideDependents', 'Hide dependents')
                            : t('showDependents', 'Show dependents')}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {isVerified && showDependents && hiePatientData && (
              <div className={styles.dependentsSection}>
                <div className={styles.dependentsContainer}>
                  <DependentsComponent patient={hiePatientData} otpExpiryMinutes={otpExpiryMinutes} />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default LocalPatientCard;
