import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig, formatDate, showModal, showSnackbar, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import {
  CardHeader,
  EmptyDataIllustration,
  launchPatientWorkspace,
  PatientChartPagination,
} from '@openmrs/esm-patient-common-lib';
import { ComboBox, Dropdown, DataTableSkeleton, Layer, Tile } from '@carbon/react';
import { KeyedMutator } from 'swr';
import styles from './case-encounter-header.scss';
import GenericTable from '../../specialized-clinics/generic-nav-links/generic-table.component';
import { useInfiniteVisits, deleteEncounter } from './case-encounter-table.resource';
import { ConfigObject } from '../../config-schema';

interface CaseEncounterProps {
  mutate: KeyedMutator<any>;
  patientUuid: string;
  onFilterChange: (formUuid: string) => void;
}

interface CaseEncounterOverviewComponentProps {
  patientUuid: string;
}

const CaseEncounterHeader = ({ patientUuid, mutate, onFilterChange }: CaseEncounterProps) => {
  const { t } = useTranslation();
  const title = t('caseEncounter', 'Case management encounters');
  const { caseManagementForms } = useConfig<ConfigObject>();

  const handleOpenOrEditClinicalEncounterForm = (formUuid: string, encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Clinical Encounter',
      mutateForm: mutate,
      formInfo: {
        encounterUuid: encounterUUID,
        formUuid,
        patientUuid,
        visitTypeUuid: '',
        visitUuid: '',
      },
    });
  };

  const items = caseManagementForms.map((form) => ({
    id: form.id,
    text: form.title,
    formUuid: form.formUuid,
    filterUuid: form.formUuid,
  }));

  const handleComboBoxChange = ({ selectedItem }) => {
    if (selectedItem) {
      handleOpenOrEditClinicalEncounterForm(selectedItem.formUuid);
    }
  };

  const handleEncounterTypeChange = ({ selectedItem }) => {
    onFilterChange(selectedItem.filterUuid);
  };

  return (
    <>
      <div className={styles.widgetCard}>
        <CardHeader title={title}>
          <div className={styles.controlsContainer}>
            <Dropdown
              id="serviceFilter"
              initialSelectedItem={{ text: t('all', 'All'), filterUuid: '' }}
              label=""
              titleText={t('filterByForm', 'Filter by form') + ':'}
              type="inline"
              items={[{ text: t('all', 'All'), filterUuid: '' }, ...items]}
              itemToString={(item) => (item ? item.text : '')}
              onChange={handleEncounterTypeChange}
              size="sm"
            />
            <ComboBox
              onChange={handleComboBoxChange}
              size="sm"
              id="select-form"
              items={items}
              itemToString={(item) => (item ? item.text : '')}
              placeholder="Select forms"
              className={styles.comboBox}
            />
          </div>
        </CardHeader>
      </div>
    </>
  );
};

const CaseEncounterOverviewComponent = ({ patientUuid }: CaseEncounterOverviewComponentProps) => {
  const { visits, isLoading, error, hasMore, isValidating, mutateVisits, setSize, size } =
    useInfiniteVisits(patientUuid);
  const { t } = useTranslation();
  const { caseManagementForms } = useConfig<ConfigObject>();
  const [filterFormUuid, setFilterFormUuid] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const layout = useLayoutType();

  const formUuids = caseManagementForms.map((form) => form.formUuid);

  const filteredEncounters =
    visits
      ?.flatMap((visit) => visit.encounters)
      .filter((encounter) =>
        filterFormUuid ? encounter.form?.uuid === filterFormUuid : formUuids.includes(encounter.form?.uuid),
      ) || [];

  const visitTypeMap = visits?.reduce((acc, visit) => {
    visit.encounters.forEach((encounter) => {
      acc[encounter.uuid] = visit.visitType?.display ?? '--';
    });
    return acc;
  }, {} as Record<string, string>);

  const paginatedEncounters = filteredEncounters.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const genericTableHeader = [
    { header: 'Date', key: 'encounterDatetime' },
    { header: 'Visit Type', key: 'visitType' },
    { header: 'Encounter type', key: 'encounterType' },
    { header: 'Form name', key: 'formName' },
  ];

  function formatProviderName(display) {
    if (!display) {
      return '--';
    }
    return display.split(':')[0].trim();
  }

  const rows = paginatedEncounters.map((encounter) => ({
    id: `${encounter.uuid}`,
    encounterDatetime: formatDate(new Date(encounter.encounterDatetime)),
    visitType: visitTypeMap[encounter.uuid] ?? '--',
    encounterType: encounter.encounterType?.display ?? '--',
    formName: encounter.form?.display ?? '--',
  }));

  const handleWorkspaceEditForm = (encounterUuid: string) => {
    const encounter = paginatedEncounters.find((enc) => enc.uuid === encounterUuid);
    const workspaceTitle = encounter.form?.display ?? '';
    const encounterTypeUuid = encounter.encounterType?.uuid ?? '';
    const formUuid = encounter.form?.uuid ?? '';

    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle,
      mutateForm: mutateVisits,
      formInfo: {
        encounterUuid,
        formUuid,
        additionalProps: {
          encounterTypeUuid,
        },
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
              mutateVisits?.();
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
    [t, mutateVisits],
  );

  const handlePageChange = ({ page }) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <DataTableSkeleton rowCount={10} />;
  }

  return (
    <>
      <CaseEncounterHeader patientUuid={patientUuid} mutate={mutateVisits} onFilterChange={setFilterFormUuid} />
      {filteredEncounters.length === 0 ? (
        <Layer>
          <Tile className={styles.tile}>
            <EmptyDataIllustration />
            <p className={styles.content}>
              {t('noEncounterToDisplay', 'There are no encounters to display for this patient.')}
            </p>
          </Tile>
        </Layer>
      ) : (
        <>
          <GenericTable
            encounters={paginatedEncounters}
            onEdit={handleWorkspaceEditForm}
            onDelete={handleDeleteEncounter}
            headers={genericTableHeader}
            rows={rows}
          />
          {filteredEncounters.length > pageSize && (
            <PatientChartPagination
              currentItems={paginatedEncounters.length}
              onPageNumberChange={handlePageChange}
              pageNumber={currentPage}
              pageSize={pageSize}
              totalItems={filteredEncounters.length}
            />
          )}
        </>
      )}
    </>
  );
};

export default CaseEncounterOverviewComponent;
