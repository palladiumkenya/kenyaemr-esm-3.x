import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
  Button,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { EmptyDataIllustration, ErrorState, CardHeader } from '@openmrs/esm-patient-common-lib';
import { formatDate, isDesktop, navigate, useConfig, useLayoutType } from '@openmrs/esm-framework';

import type { ConfigObject } from '../config-schema';
import styles from './labour-delivery.scss';
import ConceptObservations from '../family-history/concept-obs.component';
import { useRelationships } from '../family-history/relationships.resource';
import { useEncounterRows } from '../hooks/useEncounterRows';
import { usePartograph } from '../hooks/usePartograph';
import { getObsFromEncounter } from '../encounter-list/encounter-list-utils';

interface FamilyHistoryProps {
  encounterTypeUuid: string;
  formEntrySub: any;
  launchPatientWorkspace: Function;
  patientUuid: string;
  filter?: (encounter: any) => boolean;
}

const Partograph: React.FC<FamilyHistoryProps> = ({ patientUuid, encounterTypeUuid, filter }) => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const layout = useLayoutType();
  const { concepts } = config;
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { encounters, isLoading, error } = usePartograph(patientUuid);
  const headerTitle = t('partograph', 'Partograph');

  const headers = [
    {
      header: t('date', 'Date'),
      key: 'date',
    },
    {
      header: t('timeRecorded', 'Time Recorded'),
      key: 'timeRecorded',
    },
    {
      header: t('fetalHeartRate', 'Fetal Heart Rate'),
      key: 'fetalHeartRate',
    },
    {
      header: t('cervicalDilation', 'Cervical Dilation cm'),
      key: 'cervicalDilation',
    },
    {
      header: t('descentOfHead', 'Descent of Head'),
      key: 'descentOfHead',
    },
    {
      header: t('contractionFrequency', 'Contraction Frequency'),
      key: 'contractionFrequency',
    },
    {
      header: t('contractionDuration', 'Contraction Duration'),
      key: 'contractionDuration',
    },
  ];
  const targetConceptUuids = [
    '163191AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '162261AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '167149AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '162653AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '163286AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '1810AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    '1440AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  ];

  const tableRows = encounters.forEach((obs) => {
    obs.groupMembers.forEach((groupMember) => {
      if (targetConceptUuids.includes(groupMember?.concept?.uuid)) {
        let value;
        if (typeof groupMember.value === 'object' && groupMember.value.display) {
          value = groupMember.value.display;
        } else {
          value = groupMember.value;
        }
      }
    }) ?? [];
  });
  const handleAddHistory = () => {
    navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/edit` });
  };

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (encounters.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>There is no family history data to display for this patient.</p>
          <Button onClick={handleAddHistory} renderIcon={Add} kind="ghost">
            {t('recordHistory', 'Record History')}
          </Button>
        </Tile>
      </Layer>
    );
  }

  return (
    <DataTable
      useZebraStyles
      headers={headers}
      render={({ rows, headers, getHeaderProps, getTableProps, getTableContainerProps }) => {
        return (
          <TableContainer {...getTableContainerProps()}>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      {...getHeaderProps({
                        header,
                        isSortable: header.isSortable,
                      })}>
                      {header.header?.content ?? header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
    />
  );
};
export default Partograph;
