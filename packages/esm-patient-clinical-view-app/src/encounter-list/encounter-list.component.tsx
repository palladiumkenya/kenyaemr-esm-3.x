import { navigate } from '@openmrs/esm-framework';
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
import { Add } from '@carbon/react/icons';
import { useEncounterRows } from '../../src/hooks/useEncounterRows';
import { EmptyDataIllustration, EmptyState } from '@openmrs/esm-patient-common-lib';
import { OpenmrsEncounter } from '../types';

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
  const [forms, setForms] = useState<O3FormSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const formNames = useMemo(() => formList.map((form) => form.name), []);
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

  const headers = useMemo(() => {
    if (columns) {
      return columns.map((column) => {
        return { key: column.key, header: column.header };
      });
    }
    return [];
  }, [columns]);

  const expandedHeaderProps = useMemo(() => {
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
      setPaginatedRows(rows);
    },
    [columns, defaultActions, forms, moduleName, workspaceWindowSize],
  );

  useEffect(() => {
    if (encounters?.length) {
      constructPaginatedTableRows(encounters, currentPage, pageSize);
    }
  }, [encounters, pageSize, constructPaginatedTableRows, currentPage]);

  return (
    <>
      {isLoadingEncounters ? (
        <DataTableSkeleton rowCount={5} />
      ) : encounters.length > 0 ? (
        <>
          <div className={styles.widgetContainer}>
            <div className={styles.widgetHeaderContainer}>
              {!hideFormLauncher && <div className={styles.toggleButtons}>{}</div>}
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
        <div className={styles.widgetContainer}>
          <Layer className={styles.emptyStateContainer}>
            <Tile className={styles.tile}>
              <div>
                <EmptyDataIllustration />
              </div>
              <p className={styles.content}>There are no encounters to display</p>
            </Tile>
          </Layer>
        </div>
      )}
    </>
  );
};
