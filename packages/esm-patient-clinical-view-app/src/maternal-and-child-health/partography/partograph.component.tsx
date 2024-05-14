import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  Layer,
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
import { formatDate, isDesktop, launchWorkspace, useLayoutType } from '@openmrs/esm-framework';
import styles from './labour-delivery.scss';
import { usePartograph } from '../../hooks/usePartograph';
import dayjs from 'dayjs';
import {
  CervicalDilation,
  DeviceRecorded,
  FetalHeartRate,
  PartographEncounterFormUuid,
  SurgicalProcedure,
  descentOfHeadObj,
} from '../../utils/constants';

interface PartographyProps {
  patientUuid: string;
  filter?: (encounter: any) => boolean;
}

const Partograph: React.FC<PartographyProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { encounters = [], isLoading, error, mutate } = usePartograph(patientUuid);
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
  ];
  const tableRows =
    encounters.map((encounter) => {
      const groupMembers = encounter.groupMembers;
      const groupmembersObj = groupMembers.reduce((acc, curr) => {
        acc[curr.concept.uuid] =
          typeof curr.value === 'string' || typeof curr.value === 'number' ? curr.value : curr.value.uuid;
        return acc;
      });
      return {
        id: `${encounter.uuid}`,
        date: formatDate(new Date(encounter.obsDatetime)),
        timeRecorded: dayjs(new Date(groupmembersObj[DeviceRecorded])).format('HH:mm'),
        fetalHeartRate: groupmembersObj[FetalHeartRate],
        cervicalDilation: groupmembersObj[CervicalDilation],
        descentOfHead: descentOfHeadObj[groupmembersObj[SurgicalProcedure]],
        contractionFrequency: '--', // TODO: get from obsGroup 163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        contractionDuration: '--', // TODO: get from obsGroup 163750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
      };
    }) ?? [];

  const handleAddHistory = () => {
    launchWorkspace('patient-form-entry-workspace', {
      workspaceTitle: headerTitle,
      mutateForm: () => {
        mutate();
      },
      formInfo: {
        encounterUuid: '',
        formUuid: PartographEncounterFormUuid,
        additionalProps: {} ?? {},
      },
    });
  };

  if (isLoading) {
    return <DataTableSkeleton rowCount={5} />;
  }

  if (error) {
    return <ErrorState headerTitle={headerTitle} error={error} />;
  }

  if (encounters?.length === 0) {
    return (
      <Layer>
        <Tile className={styles.tile}>
          <div className={!isDesktop(layout) ? styles.tabletHeading : styles.desktopHeading}>
            <h4>{headerTitle}</h4>
          </div>
          <EmptyDataIllustration />
          <p className={styles.content}>There is no partograph data to display for this patient.</p>
          <Button onClick={handleAddHistory} renderIcon={Add} kind="ghost">
            {t('recordLabourDetails', 'Record labour details')}
          </Button>
        </Tile>
      </Layer>
    );
  }

  return (
    <Tile style={{ margin: '0.125rem' }}>
      <CardHeader title={headerTitle}>
        <Button onClick={handleAddHistory} kind="ghost" renderIcon={Add}>
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <DataTable
        useZebraStyles
        headers={headers}
        rows={tableRows}
        size="sm"
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
                        <TableCell key={cell.id}>{cell.value ?? '--'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }}
      />
    </Tile>
  );
};
export default Partograph;
