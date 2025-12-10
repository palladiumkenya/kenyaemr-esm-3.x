import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataTable, Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Button, Tag } from '@carbon/react';
import { TwoFactorAuthentication } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, showSnackbar, showModal, navigate, Visit } from '@openmrs/esm-framework';
import capitalize from 'lodash/capitalize';
import styles from './dependants.scss';
import { maskName } from '../helper';
import { findExistingLocalPatient, registerOrLaunchDependent } from '../search-bar/search-bar.resource';
import { getDependentsFromContacts, useMultipleActiveVisits } from './dependants.resource';
import { DependentWithPhone, HIEBundleResponse, HIEPatient, LocalPatient } from '../type';
import { otpManager, useOtpSource, cleanupAllOTPs } from '../card/HIE-card/hie-card.resource';
import { launchOtpVerificationModal } from '../../../shared/otp-verification';
import { sanitizePhoneNumber } from '../../../shared/utils';

type DependentProps = {
  patient: HIEPatient;
  localSearchResults?: any[] | null;
  otpExpiryMinutes?: number;
};

const DependentsComponent: React.FC<DependentProps> = ({
  patient,
  localSearchResults = null,
  otpExpiryMinutes = 5,
}) => {
  const { t } = useTranslation();
  const [submittingStates, setSubmittingStates] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [localPatientCache, setLocalPatientCache] = useState<Map<string, any>>(new Map());

  const [verifiedSpouses, setVerifiedSpouses] = useState<Set<string>>(new Set());
  const [otpRequestedForSpouse, setOtpRequestedForSpouse] = useState<Set<string>>(new Set());
  const [activePhoneNumbers, setActivePhoneNumbers] = useState<Map<string, string>>(new Map());

  const { otpSource, isLoading: isLoadingOtpSource, error: otpSourceError } = useOtpSource();

  useEffect(() => {
    if (otpSource) {
      otpManager.setOtpSource(otpSource);
    }
  }, [otpSource]);

  useEffect(() => {
    return () => {
      cleanupAllOTPs();
    };
  }, []);

  const dependents = useMemo(() => {
    try {
      return getDependentsFromContacts(patient);
    } catch (error) {
      return [];
    }
  }, [patient]);

  const dependentUuids = useMemo(() => {
    return dependents.map((dependent) => {
      const localPatient = localPatientCache.get(dependent.id);
      return localPatient?.uuid || null;
    });
  }, [dependents, localPatientCache]);

  const visits = useMultipleActiveVisits(dependentUuids);

  const handleQueuePatient = useCallback((activeVisit: Visit, patientUuid: string) => {
    const dispose = showModal('transition-patient-to-latest-queue-modal', {
      closeModal: () => {
        dispose();
      },
      activeVisit,
    });
  }, []);

  const getDependentPhoneNumber = useCallback(
    (dependent: HIEPatient | DependentWithPhone): string | undefined => {
      if ('contact' in dependent && dependent.contact && Array.isArray(dependent.contact)) {
        for (const contact of dependent.contact) {
          if (contact.telecom && Array.isArray(contact.telecom)) {
            const phoneTelecom = contact.telecom.find(
              (telecom) =>
                telecom.system === 'phone' && telecom.value && telecom.value !== 'N/A' && telecom.value.trim() !== '',
            );

            if (phoneTelecom) {
              return sanitizePhoneNumber(phoneTelecom.value);
            }
          }
        }
      }

      const localPatient = localPatientCache.get(dependent.id);
      if (localPatient?.attributes && Array.isArray(localPatient.attributes)) {
        const phoneAttribute = localPatient.attributes.find(
          (attr: { value: string; attributeType: { uuid: string; display: string } }) =>
            attr.attributeType?.uuid === 'b2c38640-2603-4629-aebd-3b54f33f1e3a' &&
            attr.value &&
            attr.value.trim() !== '' &&
            attr.value.trim().length > 0,
        );

        if (phoneAttribute?.value) {
          return sanitizePhoneNumber(phoneAttribute.value);
        }
      }

      if ('phoneNumber' in dependent && typeof dependent.phoneNumber === 'string') {
        const phone = dependent.phoneNumber.trim();
        if (phone && phone !== 'N/A' && phone.length > 0) {
          return sanitizePhoneNumber(phone);
        }
      }

      if ('contactData' in dependent && dependent.contactData) {
        if ('telecom' in dependent.contactData && Array.isArray(dependent.contactData.telecom)) {
          const phoneTelecom = dependent.contactData.telecom.find(
            (telecom: any) =>
              telecom.system === 'phone' && telecom.value && telecom.value !== 'N/A' && telecom.value.trim() !== '',
          );
          if (phoneTelecom?.value) {
            return sanitizePhoneNumber(phoneTelecom.value);
          }
        }
      }

      return '254700000000';
    },
    [localPatientCache],
  );

  const handleSpouseOTPRequest = useCallback((dependentId: string) => {
    setOtpRequestedForSpouse((prev) => new Set(prev).add(dependentId));
  }, []);

  const handleSpouseOTPVerificationSuccess = useCallback((dependentId: string) => {
    setVerifiedSpouses((prev) => new Set(prev).add(dependentId));
    setOtpRequestedForSpouse((prev) => {
      const newSet = new Set(prev);
      newSet.delete(dependentId);
      return newSet;
    });
    setActivePhoneNumbers((prev) => {
      const newMap = new Map(prev);
      newMap.delete(dependentId);
      return newMap;
    });
  }, []);

  const createSpouseOTPHandlers = useCallback(
    (dependentId: string, dependentName: string, initialPhone: string) => {
      return {
        onRequestOtp: async (phoneNumber: string): Promise<void> => {
          const sanitizedPhone = sanitizePhoneNumber(phoneNumber);

          try {
            if (!otpSource) {
              throw new Error('OTP source not configured. Please contact your administrator.');
            }

            otpManager.setOtpSource(otpSource);

            setActivePhoneNumbers((prev) => new Map(prev.set(dependentId, sanitizedPhone)));

            await otpManager.requestOTP(sanitizedPhone, dependentName, otpExpiryMinutes, null, dependentId);
          } catch (error) {
            throw error;
          }
        },
        onVerify: async (otp: string): Promise<void> => {
          try {
            if (!otpSource) {
              throw new Error('OTP source not configured. Please contact your administrator.');
            }

            otpManager.setOtpSource(otpSource);

            const activePhone = activePhoneNumbers.get(dependentId) || initialPhone;
            const sanitizedPhone = sanitizePhoneNumber(activePhone);

            const isValid = await otpManager.verifyOTP(sanitizedPhone, otp, dependentId);
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
    [activePhoneNumbers, otpExpiryMinutes, otpSource],
  );

  const handleDependentAction = useCallback(
    async (dependent: any) => {
      const localPatient = localPatientCache.get(dependent.id);
      const isSpouse = dependent.relationship.toLowerCase() === 'spouse';
      const isSpouseVerified = verifiedSpouses.has(dependent.id);

      if (isSpouse && !isSpouseVerified && !localPatient) {
        showSnackbar({
          title: t('verificationRequired', 'Verification Required'),
          subtitle: t('spouseVerificationRequired', 'Please verify the spouse with OTP before registering'),
          kind: 'warning',
          isLowContrast: false,
        });
        return;
      }

      if (localPatient) {
        const localPatientName =
          localPatient.person?.personName?.display ||
          `${localPatient.person?.personName?.givenName || ''} ${localPatient.person?.personName?.middleName || ''} ${
            localPatient.person?.personName?.familyName || ''
          }`.trim() ||
          dependent.name;

        launchWorkspace('start-visit-workspace-form', {
          patientUuid: localPatient.uuid,
          workspaceTitle: t('checkInPatientWorkspaceTitle', 'Check in patient'),
        });
      } else {
        setSubmittingStates((prev) => ({ ...prev, [dependent.id]: true }));

        try {
          await registerOrLaunchDependent(dependent, t);
        } catch (error) {
          showSnackbar({
            title: t('dependentRegistrationError', 'Error registering dependent'),
            subtitle: t('dependentRegistrationErrorSubtitle', 'Error registering dependent: {{error}}', {
              error: (error as Error).message,
            }),
            kind: 'error',
            isLowContrast: false,
          });
        } finally {
          setSubmittingStates((prev) => ({ ...prev, [dependent.id]: false }));
        }
      }
    },
    [localPatientCache, verifiedSpouses, t],
  );

  const headers = useMemo(
    () => [
      {
        key: 'name',
        header: t('name', 'Name'),
      },
      {
        key: 'relationship',
        header: t('relationship', 'Relationship'),
      },
      {
        key: 'gender',
        header: t('gender', 'Gender'),
      },
      {
        key: 'birthDate',
        header: t('birthDate', 'Birth Date'),
      },
      {
        key: 'identifiers',
        header: t('identifiers', 'Identifiers'),
      },
      {
        key: 'status',
        header: t('status', 'Status'),
      },
      {
        key: 'actions',
        header: t('actions', 'Actions'),
      },
    ],
    [t],
  );

  const rows = useMemo(() => {
    return dependents.map((dependent, index) => {
      const localPatient = localPatientCache.get(dependent.id);
      const isLocal = !!localPatient;
      const isSubmitting = submittingStates[dependent.id];
      const isLoading = loadingStates[dependent.id];

      const visitData = visits[index] || { activeVisit: null, isLoading: false };
      const dependentActiveVisit = visitData.activeVisit;
      const isLoadingVisit = visitData.isLoading;
      const hasActiveVisit = !!dependentActiveVisit;

      const isSpouse = dependent.relationship.toLowerCase() === 'spouse';
      const isSpouseVerified = verifiedSpouses.has(dependent.id);
      const otpRequestedForThisSpouse = otpRequestedForSpouse.has(dependent.id);

      const identifiersDisplay = dependent.id && dependent.id !== 'N/A' ? `CR Number: ${dependent.id}` : 'N/A';

      const dependentPhoneNumber = getDependentPhoneNumber(dependent);
      const { onRequestOtp, onVerify, cleanup } = createSpouseOTPHandlers(
        dependent.id,
        dependent.name,
        dependentPhoneNumber,
      );

      return {
        id: dependent.id,
        name: maskName ? maskName(capitalize(dependent.name.toLowerCase())) : capitalize(dependent.name.toLowerCase()),
        relationship: <div>{capitalize(dependent.relationship.toLowerCase())}</div>,
        gender: capitalize(dependent.gender),
        birthDate: dependent.birthDate !== 'Unknown' ? dependent.birthDate : 'N/A',
        status: (
          <div>
            {hasActiveVisit && (
              <Tag type="blue" size="md">
                {t('checkedIn', 'Checked In')}
              </Tag>
            )}
            {!hasActiveVisit && !isLoadingVisit && (
              <Tag type="gray" size="md">
                {t('notCheckedIn', 'Not Checked In')}
              </Tag>
            )}
          </div>
        ),
        identifiers: identifiersDisplay,
        actions: (
          <div className={styles.actionButtons}>
            {isSpouse && !isSpouseVerified && !otpRequestedForThisSpouse && (
              <Button
                size="sm"
                kind="primary"
                renderIcon={TwoFactorAuthentication}
                disabled={isLoadingOtpSource || !otpSource}
                onClick={() => {
                  handleSpouseOTPRequest(dependent.id);
                  launchOtpVerificationModal({
                    otpLength: 5,
                    obscureText: false,
                    phoneNumber: dependentPhoneNumber,
                    expiryMinutes: otpExpiryMinutes,
                    onRequestOtp,
                    onVerify,
                    onVerificationSuccess: () => handleSpouseOTPVerificationSuccess(dependent.id),
                    onCleanup: cleanup,
                  });
                }}>
                {isLoadingOtpSource ? t('loadingOtpConfig', 'Loading...') : t('sendOtp', 'Send OTP')}
              </Button>
            )}

            {isSpouse && !isSpouseVerified && otpRequestedForThisSpouse && (
              <Button
                size="sm"
                kind="ghost"
                renderIcon={TwoFactorAuthentication}
                onClick={() => {
                  launchOtpVerificationModal({
                    otpLength: 5,
                    obscureText: false,
                    phoneNumber: dependentPhoneNumber,
                    expiryMinutes: otpExpiryMinutes,
                    onRequestOtp,
                    onVerify,
                    onVerificationSuccess: () => handleSpouseOTPVerificationSuccess(dependent.id),
                    onCleanup: cleanup,
                  });
                }}>
                {t('enterOtp', 'Enter OTP')}
              </Button>
            )}

            {(!isSpouse || isSpouseVerified) && (
              <>
                {!isLocal && (
                  <Button
                    size="sm"
                    kind="ghost"
                    onClick={() => handleDependentAction(dependent)}
                    disabled={isSubmitting || isLoading}>
                    {isSubmitting
                      ? t('processing', 'Processing...')
                      : isLoading
                      ? t('searching', 'Searching...')
                      : t('checkIn', 'Check In Dependent')}
                  </Button>
                )}

                {isLocal && !hasActiveVisit && (
                  <Button
                    size="sm"
                    kind="secondary"
                    onClick={() => handleDependentAction(dependent)}
                    disabled={isSubmitting || isLoading || isLoadingVisit}>
                    {isLoadingVisit ? t('searching', 'Searching...') : t('checkIn', 'Check In')}
                  </Button>
                )}

                {isLocal && hasActiveVisit && (
                  <Button
                    size="sm"
                    kind="secondary"
                    onClick={() => handleQueuePatient(dependentActiveVisit, localPatient.uuid)}
                    disabled={isSubmitting || isLoading || isLoadingVisit}>
                    {t('queuePatient', 'Queue Patient')}
                  </Button>
                )}
              </>
            )}
          </div>
        ),
      };
    });
  }, [
    dependents,
    localPatientCache,
    submittingStates,
    loadingStates,
    visits,
    verifiedSpouses,
    otpRequestedForSpouse,
    isLoadingOtpSource,
    otpSource,
    getDependentPhoneNumber,
    createSpouseOTPHandlers,
    handleSpouseOTPRequest,
    handleSpouseOTPVerificationSuccess,
    handleDependentAction,
    handleQueuePatient,
    otpExpiryMinutes,
    t,
  ]);

  useEffect(() => {
    if (dependents.length === 0) {
      return;
    }

    const searchForExistingPatients = async () => {
      const searchPromises = dependents.map(async (dependent) => {
        if (localPatientCache.has(dependent.id)) {
          return;
        }

        setLoadingStates((prev) => ({ ...prev, [dependent.id]: true }));

        try {
          const existingPatient = await findExistingLocalPatient(dependent.contactData, true);
          setLocalPatientCache((prev) => new Map(prev.set(dependent.id, existingPatient)));
        } catch (error) {
          console.warn(`Error searching for dependent ${dependent.id}:`, error);
          setLocalPatientCache((prev) => new Map(prev.set(dependent.id, null)));
        } finally {
          setLoadingStates((prev) => ({ ...prev, [dependent.id]: false }));
        }
      });

      await Promise.all(searchPromises);
    };

    searchForExistingPatients();
  }, [dependents, localPatientCache]);

  if (dependents.length === 0) {
    return <div>{t('noDependentsFound', 'No dependents found for this patient')}</div>;
  }

  return (
    <div>
      <span className={styles.dependentsTitle}>
        {t('dependents', 'Dependent(s)')} ({dependents.length})
      </span>
      <DataTable size="xs" useZebraStyles rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <Table {...getTableProps()}>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHeader key={index} {...getHeaderProps({ header })}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index} {...getRowProps({ row })}>
                  {row.cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell.value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
    </div>
  );
};

export default DependentsComponent;
