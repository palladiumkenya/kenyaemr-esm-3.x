import React, { useEffect, useState } from 'react';
import { CardHeader, EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash/capitalize';
import { ErrorState, launchWorkspace, showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { ConfigObject } from '../../config-schema';
import { genericTableHeader, useEncounters } from './useEncounters';
import { DataTableSkeleton, Button } from '@carbon/react';
import GenericTable from './generic-table.component';
import { deleteEncounter } from '../../case-management/encounters/case-encounter-table.resource';

type GenericDashboardProps = { patientUuid: string };

const GenericDashboard: React.FC<GenericDashboardProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { specialClinics } = useConfig<ConfigObject>();
  const [clinic, setClinic] = useState('');
  const clinicInfo = specialClinics.find(({ id }) => id === clinic);
  const { encounters, isLoading, error, mutate } = useEncounters(
    clinicInfo?.encounterTypeUuid,
    clinicInfo?.formUuid,
    patientUuid,
  );

  useEffect(() => {
    const handleURLChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const clinicParam = urlParams.get('clinic');
      if (clinicParam) {
        setClinic(clinicParam);
      }
    };

    // Call once on initial load
    handleURLChange();
    window.onpopstate = handleURLChange;
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const clinicalFormTitle = capitalize(clinic.replace('-', ' '));

  const handleWorkspaceForm = () => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: clinicalFormTitle.replace('clinic', 'form'),
      mutateForm: mutate,
      formInfo: {
        encounterUuid: '',
        formUuid: clinicInfo?.formUuid,
        additionalProps: {},
      },
    });
  };
  const handleWorkspaceEditForm = (encounterUuid: string = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: clinicalFormTitle.replace('clinic', 'form'),
      mutateForm: mutate,
      formInfo: {
        encounterUuid: encounterUuid,
        formUuid: clinicInfo?.formUuid,
        additionalProps: {},
      },
    });
  };

  const handleDeleteEncounter = React.useCallback(
    (encounterUuid: string, encounterTypeName?: string) => {
      const close = showModal('delete-encounter-modal', {
        close: () => close(),
        encounterTypeName: encounterTypeName || '',
        onConfirmation: () => {
          const abortController = new AbortController();
          deleteEncounter(encounterUuid, abortController)
            .then(() => {
              mutate?.();
              showSnackbar({
                isLowContrast: true,
                title: t('encounterDeleted', 'Encounter deleted'),
                subtitle: `Encounter ${t('successfullyDeleted', 'successfully deleted')}`,
                kind: 'success',
              });
            })
            .catch(() => {
              showSnackbar({
                isLowContrast: false,
                title: t('error', 'Error'),
                subtitle: `Encounter ${t('failedDeleting', "couldn't be deleted")}`,
                kind: 'error',
              });
            });
          close();
        },
      });
    },
    [t, mutate],
  );

  if (isLoading) {
    return <DataTableSkeleton headers={genericTableHeader} aria-label="sample table" />;
  }

  if (error) {
    return <ErrorState headerTitle={clinicalFormTitle} error={error} />;
  }

  if (encounters.length === 0) {
    return (
      <EmptyState headerTitle={clinicalFormTitle} displayText={clinicalFormTitle} launchForm={handleWorkspaceForm} />
    );
  }

  return (
    <div>
      <CardHeader title={clinicalFormTitle}>
        <Button onClick={handleWorkspaceForm} kind="ghost">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <GenericTable
        encounters={encounters}
        onEdit={handleWorkspaceEditForm}
        onDelete={handleDeleteEncounter}
        headers={genericTableHeader}
      />
    </div>
  );
};

export default GenericDashboard;
