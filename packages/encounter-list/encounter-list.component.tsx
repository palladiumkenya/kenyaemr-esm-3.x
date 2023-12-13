import { navigate } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../empty-state/empty-state.component';
import { OHRIFormLauncherWithIntent } from '../ohri-form-launcher/ohri-form-launcher.component';
import styles from './encounter-list.scss';
import { OTable } from '../data-table/o-table.component';
import { Button, Link, OverflowMenu, OverflowMenuItem, Pagination, DataTableSkeleton } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { OHRIFormSchema } from '@openmrs/openmrs-form-engine-lib';
import { launchEncounterForm } from './helpers';
import { useEncounterRows } from '../../hooks/useEncounterRows';
import { OpenmrsEncounter } from '../../api/types';
import { useFormsJson } from '../../hooks/useFormsJson';
import { usePatientDeathStatus } from '../../hooks/usePatientDeathStatus';

export interface EncounterListColumn {
  key: string;
  header: string;
  getValue: (encounter: any) => string;
  link?: any;
}

export interface EncounterListProps {
  patientUuid: string;
  encounterType: string;
  columns: Array<any>;
  headerTitle: string;
  description: string;
  formList?: Array<{
    name: string;
    excludedIntents?: Array<string>;
    fixedIntent?: string;
    isDefault?: boolean;
  }>;
  launchOptions: {
    moduleName: string;
    hideFormLauncher?: boolean;
    displayText?: string;
    workspaceWindowSize?: 'minimized' | 'maximized';
  };
  filter?: (encounter: any) => boolean;
}

export const EncounterList: React.FC<EncounterListProps> = ({
  patientUuid,
  encounterType,
  columns,
  headerTitle,
  description,
  formList,
  filter,
  launchOptions,
}) => {
  const { t } = useTranslation();
  const [paginatedRows, setPaginatedRows] = useState([]);
  const [forms, setForms] = useState<OHRIFormSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const { isDead } = usePatientDeathStatus(patientUuid);
  const formNames = useMemo(() => formList.map((form) => form.name), []);
  const { formsJson, isLoading: isLoadingFormsJson } = useFormsJson(formNames);
  const {
    encounters,
    isLoading: isLoadingEncounters,
    onFormSave,
  } = useEncounterRows(patientUuid, encounterType, filter);
  const { moduleName, workspaceWindowSize, displayText, hideFormLauncher } = launchOptions;

  const defaultActions = useMemo(
    () => [
      {
        label: t('viewEncounter', 'View'),
        form: {
          name: forms[0]?.name,
        },
        mode: 'view',
        intent: '*',
      },
      {
        label: t('editEncounter', 'Edit'),
        form: {
          name: forms[0]?.name,
        },
        mode: 'view',
        intent: '*',
      },
    ],
    [forms, t],
  );

  useEffect(() => {
    if (!isLoadingFormsJson) {
      const formsWithFilteredIntents = formsJson.map((form) => {
        const descriptor = formList.find((formDescriptor) => formDescriptor.name === form.name);
        // handle excluded intents
        if (descriptor?.excludedIntents?.length) {
          form['availableIntents'] = form['availableIntents'].filter(
            (intentEntry) => !descriptor.excludedIntents.includes(intentEntry.intent),
          );
        }
        // handle fixed intent
        if (descriptor?.fixedIntent) {
          form['availableIntents'] = form['availableIntents'].filter(
            (intentEntry) => intentEntry.intent == descriptor.fixedIntent,
          );
        }
        return form;
      });
      setIsLoadingForms(false);
      setForms(formsWithFilteredIntents);
    }
  }, [formsJson, formList, isLoadingFormsJson]);

  const headers = useMemo(() => {
    if (columns) {
      return columns.map((column) => {
        return { key: column.key, header: column.header };
      });
    }
    return [];
  }, [columns]);

  const constructPaginatedTableRows = useCallback(
    (encounters: OpenmrsEncounter[], currentPage: number, pageSize: number) => {
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedEncounters = [];
      for (let i = startIndex; i < startIndex + pageSize; i++) {
        if (i < encounters.length) {
          paginatedEncounters.push(encounters[i]);
        }
      }
      const rows = paginatedEncounters.map((encounter) => {
        const tableRow: { id: string; actions: any } = { id: encounter.uuid, actions: null };
        // inject launch actions
        encounter['launchFormActions'] = {
          editEncounter: () =>
            launchEncounterForm(
              forms[0],
              moduleName,
              'edit',
              onFormSave,
              null,
              encounter.uuid,
              null,
              workspaceWindowSize,
            ),
          viewEncounter: () =>
            launchEncounterForm(
              forms[0],
              moduleName,
              'view',
              onFormSave,
              null,
              encounter.uuid,
              null,
              workspaceWindowSize,
            ),
        };
        // process columns
        columns.forEach((column) => {
          let val = column.getValue(encounter);
          if (column.link) {
            val = (
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  if (column.link.handleNavigate) {
                    column.link.handleNavigate(encounter);
                  } else {
                    column.link?.getUrl && navigate({ to: column.link.getUrl() });
                  }
                }}>
                {val}
              </Link>
            );
          }
          tableRow[column.key] = val;
        });
        // If custom config is available, generate actions accordingly; otherwise, fallback to the default actions.
        const actions = tableRow.actions?.length ? tableRow.actions : defaultActions;
        tableRow['actions'] = (
          <OverflowMenu flipped className={styles.flippedOverflowMenu}>
            {actions.map((actionItem, index) => (
              <OverflowMenuItem
                itemText={actionItem.label}
                onClick={(e) => {
                  e.preventDefault();
                  launchEncounterForm(
                    forms.find((form) => form.name == actionItem?.form?.name),
                    moduleName,
                    actionItem.mode == 'enter' ? 'add' : actionItem.mode,
                    onFormSave,
                    null,
                    encounter.uuid,
                    actionItem.intent,
                    workspaceWindowSize,
                  );
                }}
              />
            ))}
          </OverflowMenu>
        );
        return tableRow;
      });
      setPaginatedRows(rows);
    },
    [columns, defaultActions, forms, moduleName, workspaceWindowSize],
  );

  useEffect(() => {
    if (encounters?.length) {
      constructPaginatedTableRows(encounters, currentPage, pageSize);
    }
  }, [encounters, pageSize, constructPaginatedTableRows, currentPage]);

  const formLauncher = useMemo(() => {
    if (forms.length == 1 && !forms[0]['availableIntents']?.length) {
      // we only have one form with no intents
      // just return the "Add" button
      return (
        <Button
          kind="ghost"
          renderIcon={Add}
          iconDescription="Add "
          onClick={(e) => {
            e.preventDefault();
            launchEncounterForm(forms[0], moduleName, 'add', onFormSave, null, null, null, workspaceWindowSize);
          }}>
          {displayText}
        </Button>
      );
    } else if (forms.length && !(hideFormLauncher ?? isDead)) {
      return (
        <OHRIFormLauncherWithIntent
          formJsonList={forms}
          launchForm={(formJson, intent) =>
            launchEncounterForm(formJson, moduleName, 'add', onFormSave, null, null, intent, workspaceWindowSize)
          }
          title={displayText}
        />
      );
    }
  }, [forms, hideFormLauncher, isDead, displayText, moduleName, workspaceWindowSize]);

  return (
    <>
      {isLoadingEncounters || isLoadingForms ? (
        <DataTableSkeleton rowCount={5} />
      ) : encounters.length > 0 ? (
        <>
          <div className={styles.widgetContainer}>
            <div className={styles.widgetHeaderContainer}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
              {!(hideFormLauncher ?? isDead) && <div className={styles.toggleButtons}>{formLauncher}</div>}
            </div>
            <OTable tableHeaders={headers} tableRows={paginatedRows} />
            <Pagination
              page={currentPage}
              pageSize={pageSize}
              pageSizes={[10, 20, 30, 40, 50]}
              totalItems={encounters.length}
              onChange={({ page, pageSize }) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
            />
          </div>
        </>
      ) : (
        <EmptyState
          displayText={description}
          headerTitle={headerTitle}
          launchForm={() =>
            launchEncounterForm(forms[0], moduleName, 'add', onFormSave, null, null, '*', workspaceWindowSize)
          }
          launchFormComponent={formLauncher}
          hideFormLauncher={hideFormLauncher ?? isDead}
        />
      )}
    </>
  );
};
