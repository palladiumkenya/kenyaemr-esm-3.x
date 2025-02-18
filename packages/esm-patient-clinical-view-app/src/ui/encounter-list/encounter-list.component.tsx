import { ErrorState, isDesktop, navigate, useLayoutType, usePagination } from '@openmrs/esm-framework';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './encounter-list.scss';
import { OTable } from '../data-table/o-table.component';
import {
  Button,
  Link,
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  DataTableSkeleton,
  Layer,
  Tile,
} from '@carbon/react';
import { useEncounterRows } from '../../hooks/useEncounterRows';
import { EmptyDataIllustration, EmptyState } from '@openmrs/esm-patient-common-lib';
import { OpenmrsEncounter } from '../../types';

export interface O3FormSchema {
  name: string;
  pages: Array<any>;
  processor: string;
  uuid: string;
  referencedForms: [];
  encounterType: string;
  encounter?: string | OpenmrsEncounter;
  allowUnspecifiedAll?: boolean;
  defaultPage?: string;
  readonly?: string | boolean;
  inlineRendering?: 'single-line' | 'multiline' | 'automatic';
  markdown?: any;
  postSubmissionActions?: Array<{ actionId: string; config?: Record<string, any> }>;
  formOptions?: {
    usePreviousValueDisabled: boolean;
  };
  version?: string;
}
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
  formConceptMap: object;
  isExpandable?: boolean;
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
  formConceptMap,
  isExpandable,
}) => {
  const { t } = useTranslation();
  const [forms, setForms] = useState<O3FormSchema[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const layout = useLayoutType();
  const pageSizes = [10, 20, 30, 40, 50];
  const formNames = useMemo(() => formList.map((form) => form.name), [formList]);
  const { encounters, isLoading, onFormSave, error } = useEncounterRows(patientUuid, encounterType, filter);
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

  const headers = useMemo(() => {
    if (columns) {
      return columns.map((column) => {
        return { key: column.key, header: column.header };
      });
    }
    return [];
  }, [columns]);

  const { goTo, results, currentPage } = usePagination(encounters, pageSize);

  const constructTableRows = useCallback(
    (results: OpenmrsEncounter[]) => {
      const rows = results?.map((encounter) => {
        const tableRow: { id: string; actions: any; obs: any } = {
          id: encounter.uuid,
          actions: null,
          obs: encounter.obs,
        };
        // inject launch actions
        encounter['launchFormActions'] = {
          editEncounter: () => {},
          viewEncounter: () => {},
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
                key={index}
                itemText={actionItem.label}
                onClick={(e) => {
                  e.preventDefault();
                }}
              />
            ))}
          </OverflowMenu>
        );
        return tableRow;
      });
      return rows;
    },
    [columns, defaultActions],
  );

  // Call the function to obtain the rows
  const rows = constructTableRows(results);

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Layer>
          <ErrorState error={error} headerTitle={t('encountersList', 'Encounters list')} />
        </Layer>
      </div>
    );
  }

  if (rows?.length === 0) {
    return (
      <div style={{ padding: '1rem' }}>
        <EmptyState displayText={t('encounters', `${headerTitle} Encounters`)} headerTitle={headerTitle} />
      </div>
    );
  }

  return (
    <>
      {rows?.length > 0 && (
        <div className={styles.widgetContainer}>
          <div className={styles.widgetHeaderContainer}>
            {!hideFormLauncher && <div className={styles.toggleButtons}>{}</div>}
          </div>
          <OTable tableHeaders={headers} tableRows={rows} formConceptMap={formConceptMap} isExpandable={isExpandable} />
          <Pagination
            forwardText="Next page"
            backwardText="Previous page"
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={rows?.length}
            className={styles.pagination}
            size={isDesktop(layout) ? 'sm' : 'lg'}
            onChange={({ pageSize: newPageSize, page: newPage }) => {
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
              if (newPage !== currentPage) {
                goTo(newPage);
              }
            }}
          />
        </div>
      )}
    </>
  );
};
