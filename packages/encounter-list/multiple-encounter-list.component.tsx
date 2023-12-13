import { openmrsFetch, navigate } from '@openmrs/esm-framework';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './encounter-list.scss';
import { encounterRepresentation } from '../../constants';
import { EmptyState } from '../empty-state/empty-state.component';
import { DataTableSkeleton, Link, Pagination } from '@carbon/react';
import { OTable } from '../data-table/o-table.component';
import { getObsFromEncounter } from '../../utils/encounter-list-utils';

export interface MultipleEncounterListColumn {
  key: string;
  header: string;
  getValue: (encounter: any) => string;
  link?: any;
}

export interface MultipleEncounterListProps {
  patientUuid: string;
  encounterTypeUuids: Array<string>;
  columns: Array<any>;
  headerTitle: string;
  description: string;
  filter?: (encounter: any) => boolean;
}

export function getObsFromMultipleEncounters(
  encounter,
  obsConcept,
  isDate?: Boolean,
  isTrueFalseConcept?: Boolean,
  encounterIndex?: number,
) {
  return getObsFromEncounter(encounter, obsConcept, isDate, isTrueFalseConcept);
}

export const MultipleEncounterList: React.FC<MultipleEncounterListProps> = ({
  patientUuid,
  encounterTypeUuids,
  columns,
  headerTitle,
  description,
}) => {
  const { t } = useTranslation();
  const [allRows, setAllRows] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [baseEncounterType, setBaseEncounterType] = useState<string>(null);
  const [encountersMap, setEncountersMap] = useState<Record<any, Array<any>>>(null);
  const headers = useMemo(() => {
    if (columns) {
      return columns.map((column) => {
        return { key: column.key, header: column.header };
      });
    }
    return [];
  }, [columns]);

  const loadRows = useCallback(
    (encounterTypes) => {
      const encountersToTypeMap: Record<string, Array<any>> = {};

      setIsLoading(true);
      const encounterPromises = encounterTypes.map((encounterType) => {
        const query = `encounterType=${encounterType}&patient=${patientUuid}`;
        return openmrsFetch(`/ws/rest/v1/encounter?${query}&v=${encounterRepresentation}`);
      });
      Promise.all(encounterPromises).then((values) => {
        values.forEach(({ data }) => {
          if (data.results?.length > 0) {
            const sortedEncounters = data.results.sort(
              (firstEncounter, secondEncounter) =>
                new Date(secondEncounter.encounterDatetime).getTime() -
                new Date(firstEncounter.encounterDatetime).getTime(),
            );
            encountersToTypeMap[sortedEncounters[0].encounterType.uuid] = sortedEncounters;
          }
        });
        let baseType = null;
        let currentArrayWeight = 0;
        Object.entries(encountersToTypeMap).forEach(([key, value]) => {
          if (value.length > currentArrayWeight) {
            baseType = key;
          }
        });
        setBaseEncounterType(baseType);
        setEncountersMap(encountersToTypeMap);
        setIsLoading(false);
      });
    },
    [patientUuid],
  );

  useEffect(() => {
    if (baseEncounterType && encountersMap) {
      const baseEncounterArray = encountersMap[baseEncounterType];
      const otherTypes = Object.keys(encountersMap).filter((encounterType) => encounterType != baseEncounterType);
      const encountersChunck: any[] = baseEncounterArray.map((encounter, index) => {
        const encountersPerRow = {};
        encountersPerRow[baseEncounterType] = encounter;
        otherTypes.forEach((type) => {
          const otherEncounters = encountersMap[type];
          encountersPerRow[type] = otherEncounters[index];
        });
        return encountersPerRow;
      });
      const rows = encountersChunck.map((encountersRow) => {
        const row = { id: Object.values(encountersRow)[0]['uuid'] };
        columns.forEach((column) => {
          let val = column.getValue(encountersRow);
          if (column.link) {
            val = (
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  if (column.link.handleNavigate) {
                    column.link.handleNavigate(encountersRow);
                  } else {
                    column.link?.getUrl && navigate({ to: column.link.getUrl() });
                  }
                }}>
                {val}
              </Link>
            );
          }
          row[column.key] = val;
        });
        return row;
      });
      setAllRows(rows);
      updateTable(rows, 0, pageSize);
    }
  }, [baseEncounterType, encountersMap, columns]);

  const updateTable = (fullDataSet, start, itemCount) => {
    let currentRows = [];

    for (let i = start; i < start + itemCount; i++) {
      if (i < fullDataSet.length) {
        currentRows.push(fullDataSet[i]);
      }
    }
    setTableRows(currentRows);
  };

  useEffect(() => {
    loadRows(encounterTypeUuids);
  }, [counter]);

  return (
    <>
      {isLoading ? (
        <DataTableSkeleton rowCount={5} />
      ) : allRows.length > 0 ? (
        <>
          <div className={styles.widgetContainer}>
            <div className={styles.widgetHeaderContainer}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>{headerTitle}</h4>
            </div>
            <OTable tableHeaders={headers} tableRows={tableRows} />
            <Pagination
              page={page}
              pageSize={pageSize}
              pageSizes={[10, 20, 30, 40, 50]}
              totalItems={allRows.length}
              onChange={({ page, pageSize }) => {
                let startOffset = (page - 1) * pageSize;
                updateTable(allRows, startOffset, pageSize);
                setPage(page);
                setPageSize(pageSize);
              }}
            />
          </div>
        </>
      ) : (
        <EmptyState displayText={description} headerTitle={headerTitle} />
      )}
    </>
  );
};
