import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@carbon/react';
import { TwoFactorAuthentication, ChevronUp, ChevronDown } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import styles from '../card.scss';
import DependentsComponent from '../../dependants/dependants.component';
import { LocalResponse, type HIEBundleResponse, type EligibilityResponse } from '../../type';
import { hasDependents } from '../../helper';
import {
  launchWorkspace,
  PatientPhoto,
  useVisit,
  showModal,
  ExtensionSlot,
  navigate,
  closeWorkspace,
} from '@openmrs/esm-framework';
import { EnhancedPatientBannerPatientInfo } from '../../patient-banner/patient-banner.component';
import { findExistingLocalPatient, registerOrLaunchHIEPatient } from '../../search-bar/search-bar.resource';
import { launchOtpVerificationModal } from '../../../../shared/otp-verification';
import { otpManager } from './hie-card.resource';
import { useMultipleActiveVisits } from '../../dependants/dependants.resource';

interface HIEDisplayCardProps {
  bundle: HIEBundleResponse;
  bundleIndex: number;
  searchedNationalId: string | null;
  otpExpiryMinutes?: number;
  localSearchResults?: LocalResponse | null;
  eligibilityResponse?: EligibilityResponse;
}

const HIEDisplayCard: React.FC<HIEDisplayCardProps> = ({
  bundle,
  bundleIndex,
  searchedNationalId,
  otpExpiryMinutes = 5,
  localSearchResults = null,
  eligibilityResponse,
}) => {
  const { t } = useTranslation();
  const [showDependentsForPatient, setShowDependentsForPatient] = useState<Set<string>>(new Set());
  const [verifiedPatients, setVerifiedPatients] = useState<Set<string>>(new Set());
  const [otpRequestedFor, setOtpRequestedFor] = useState<Set<string>>(new Set());
  const [localPatientCache, setLocalPatientCache] = useState<Map<string, any>>(new Map());
  const [loadingLocalPatients, setLoadingLocalPatients] = useState<Set<string>>(new Set());
  const [activePhoneNumbers, setActivePhoneNumbers] = useState<Map<string, string>>(new Map());

  const patientUuids = useMemo(() => {
    return (
      bundle.entry
        ?.map((entry) => {
          const localPatient = localPatientCache.get(entry.resource.id);
          return localPatient?.uuid || null;
        })
        .filter(Boolean) || []
    );
  }, [bundle.entry, localPatientCache]);

  const visits = useMultipleActiveVisits(patientUuids);

  useEffect(() => {
    const searchForExistingPatients = async () => {
      if (!bundle.entry) {
        return;
      }

      const searchPromises = bundle.entry.map(async (entry) => {
        const patient = entry.resource;
        const patientUuid = patient.id;

        if (localPatientCache.has(patientUuid)) {
          return;
        }

        setLoadingLocalPatients((prev) => new Set(prev.add(patientUuid)));

        try {
          const existingPatient = await findExistingLocalPatient(patient, false);
          setLocalPatientCache((prev) => new Map(prev.set(patientUuid, existingPatient)));
        } catch (error) {
          console.warn(`Error searching for HIE patient ${patientUuid}:`, error);
          setLocalPatientCache((prev) => new Map(prev.set(patientUuid, null)));
        } finally {
          setLoadingLocalPatients((prev) => {
            const newSet = new Set(prev);
            newSet.delete(patientUuid);
            return newSet;
          });
        }
      });

      await Promise.all(searchPromises);
    };

    searchForExistingPatients();
  }, [bundle.entry, localPatientCache]);

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

  const getPatientPhoneNumber = (patient: any): string => {
    const phoneContact = patient.telecom?.find(
      (contact: any) => contact.system === 'phone' || contact.use === 'mobile',
    );

    if (phoneContact?.value) {
      return phoneContact.value;
    }

    const localPatient = localPatientCache.get(patient.id);
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
    setActivePhoneNumbers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(patientId);
      return newMap;
    });
  };

  const handleQueuePatient = (activeVisit: any, patientUuid: string) => {
    const dispose = showModal('transition-patient-to-latest-queue-modal', {
      closeModal: () => {
        navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` });
        dispose();
      },
      activeVisit,
    });
  };

  const createDynamicOTPHandlers = (patientUuid: string, patientName: string, initialPhone: string) => {
    return {
      onRequestOtp: async (phoneNumber: string): Promise<void> => {
        setActivePhoneNumbers((prev) => new Map(prev.set(patientUuid, phoneNumber)));
        await otpManager.requestOTP(phoneNumber, patientName, otpExpiryMinutes);
      },
      onVerify: async (otp: string): Promise<void> => {
        const activePhone = activePhoneNumbers.get(patientUuid) || initialPhone;

        const isValid = await otpManager.verifyOTP(activePhone, otp);
        if (!isValid) {
          throw new Error('OTP verification failed');
        }
      },
    };
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

        const localPatient = localPatientCache.get(patientUuid);
        const hasLocal = !!localPatient;
        const isSearchingLocal = loadingLocalPatients.has(patientUuid);

        const visitIndex = patientUuids.findIndex((uuid) => uuid === localPatient?.uuid);
        const activeVisit = visitIndex !== -1 ? visits[visitIndex]?.activeVisit : null;
        const hasActiveVisit = !!activeVisit;

        const patientPhoneNumber = getPatientPhoneNumber(patient);

        const { onRequestOtp, onVerify } = createDynamicOTPHandlers(patientUuid, patientName, patientPhoneNumber);

        return (
          <React.Fragment key={patientKey}>
            <div
              className={classNames(styles.container, {
                [styles.verifiedPatient]: isVerified,
                [styles.activeVisitPatient]: hasActiveVisit,
              })}
              role="banner">
              <div className={styles.patientInfo}>
                <div className={styles.patientAvatar} role="img">
                  <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
                </div>
                <EnhancedPatientBannerPatientInfo
                  crNumber={patient?.id}
                  patient={patient}
                  renderedFrom="hie-search"
                  eligibilityData={eligibilityResponse}
                  isEligibilityLoading={false}
                />
              </div>

              <div className={styles.buttonCol}>
                <div className={styles.actionButtons}>
                  {!isVerified && !otpRequested && (
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={TwoFactorAuthentication}
                      disabled={isSearchingLocal}
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
                      {isSearchingLocal ? t('checking', 'Checking...') : t('sendOtp', 'Send OTP')}
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
                        });
                      }}>
                      {t('enterOtp', 'Enter OTP')}
                    </Button>
                  )}

                  {isVerified && (
                    <>
                      {hasLocal && !hasActiveVisit && (
                        <Button
                          kind="secondary"
                          size="sm"
                          onClick={() => {
                            const localPatientName =
                              localPatient?.person?.personName?.display ||
                              `${localPatient?.person?.personName?.givenName || ''} ${
                                localPatient?.person?.personName?.middleName || ''
                              } ${localPatient?.person?.personName?.familyName || ''}`.trim() ||
                              patientName;

                            launchWorkspace('start-visit-workspace-form', {
                              patientUuid: localPatient.uuid,
                              workspaceTitle: t('startVisitWorkspaceTitle', 'Start Visit for {{patientName}}', {
                                patientName: localPatientName,
                              }),
                            });
                          }}>
                          {t('checkIn', 'Check In')}
                        </Button>
                      )}

                      {hasLocal && hasActiveVisit && (
                        <Button kind="secondary" size="sm" onClick={() => handleQueuePatient(activeVisit, patientUuid)}>
                          {t('queuePatient', 'Queue Patient')}
                        </Button>
                      )}

                      {!hasLocal && (
                        <Button
                          kind="secondary"
                          size="sm"
                          onClick={async () => {
                            const localPatient = await registerOrLaunchHIEPatient(patient, t);
                            launchWorkspace('start-visit-workspace-form', {
                              patientUuid: localPatient.uuid,
                              workspaceTitle: t('checkInPatientWorkspaceTitle', 'Check in patient'),
                              closeWorkspace: () => {
                                closeWorkspace('start-visit-workspace-form', {
                                  onWorkspaceClose: () => {
                                    navigate({ to: `\${openmrsSpaBase}/patient/${localPatient.uuid}/chart` });
                                  },
                                  ignoreChanges: true,
                                });
                              },
                              closeWorkspaceWithSavedChanges: () => {
                                closeWorkspace('start-visit-workspace-form', {
                                  onWorkspaceClose: () => {
                                    navigate({ to: `$\{openmrsSpaBase}/patient/${localPatient.uuid}/chart` });
                                  },
                                  ignoreChanges: true,
                                });
                              },
                            });
                          }}>
                          {t('register', 'Register')}
                        </Button>
                      )}

                      {patientHasDependents && (
                        <Button
                          iconDescription={showDependents ? 'Hide dependents' : 'Show dependents'}
                          kind="tertiary"
                          size="sm"
                          onClick={() => {
                            toggleDependentsVisibility(patientKey);
                          }}
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

            {isVerified && showDependents && patientHasDependents && (
              <div className={styles.dependentsSection}>
                <div className={styles.dependentsContainer}>
                  <DependentsComponent patient={patient} localSearchResults={localSearchResults} />
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default HIEDisplayCard;
