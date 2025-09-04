import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataTable, Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Button, Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace, showSnackbar, showModal } from '@openmrs/esm-framework';
import capitalize from 'lodash/capitalize';
import styles from './dependants.scss';
import { maskName } from '../helper';
import { findExistingLocalPatient, registerOrLaunchDependent } from '../search-bar/search-bar.resource';
import { getDependentsFromContacts, useMultipleActiveVisits } from './dependants.resource';
import { HIEBundleResponse, HIEPatient } from '../type';

type DependentProps = {
  patient: HIEPatient;
  localSearchResults?: any[] | null;
};

const DependentsComponent: React.FC<DependentProps> = ({ patient, localSearchResults = null }) => {
  const { t } = useTranslation();
  const [submittingStates, setSubmittingStates] = useState<Record<string, boolean>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [localPatientCache, setLocalPatientCache] = useState<Map<string, any>>(new Map());

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

  const handleQueuePatient = useCallback((activeVisit: any) => {
    const dispose = showModal('transition-patient-to-latest-queue-modal', {
      closeModal: () => dispose(),
      activeVisit,
    });
  }, []);

  const handleDependentAction = useCallback(
    async (dependent: any) => {
      const localPatient = localPatientCache.get(dependent.id);

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
    [localPatientCache, t],
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

      const identifierParts = [];
      if (dependent.nationalId && dependent.nationalId !== 'N/A') {
        identifierParts.push(`ID: ${dependent.nationalId}`);
      }
      if (dependent.shaNumber && dependent.shaNumber !== 'N/A') {
        identifierParts.push(`SHA: ${dependent.shaNumber}`);
      }
      if (dependent.birthCertificate && dependent.birthCertificate !== 'N/A') {
        identifierParts.push(`BC: ${dependent.birthCertificate}`);
      }
      const identifiersDisplay = identifierParts.length > 0 ? identifierParts.join(', ') : 'N/A';

      return {
        id: dependent.id,
        name: maskName ? maskName(capitalize(dependent.name.toLowerCase())) : capitalize(dependent.name.toLowerCase()),
        relationship: capitalize(dependent.relationship.toLowerCase()),
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
                  : t('registerDependent', 'Register Dependent')}
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
                onClick={() => handleQueuePatient(dependentActiveVisit)}
                disabled={isSubmitting || isLoading || isLoadingVisit}>
                {t('queuePatient', 'Queue Patient')}
              </Button>
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
    handleDependentAction,
    handleQueuePatient,
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
