import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate, useConfig } from '@openmrs/esm-framework';
import {
  Alcohol_Use_UUID,
  Alcohol_Use_Duration_UUID,
  Smoking_UUID,
  Smoking_Duration_UUID,
  Other_Substance_Abuse_UUID,
} from '../../../utils/constants';
import { getObsFromEncounter } from '../../../ui/encounter-list/encounter-list-utils';
import { EmptyState, launchPatientWorkspace, ErrorState, CardHeader } from '@openmrs/esm-patient-common-lib';
import {
  OverflowMenu,
  OverflowMenuItem,
  InlineLoading,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import { ConfigObject } from '../../../config-schema';
import { Add } from '@carbon/react/icons';
import { OpenmrsEncounter } from '../../../types';
import { KeyedMutator, mutate } from 'swr';
interface OutPatientSocialHistoryProps {
  patientUuid: string;
  encounters: OpenmrsEncounter[];
  isLoading: boolean;
  error: Error;
  isValidating: boolean;
  mutate: KeyedMutator<any>;
}

const OutPatientSocialHistory: React.FC<OutPatientSocialHistoryProps> = ({
  patientUuid,
  encounters,
  isLoading,
  error,
  isValidating,
}) => {
  const { t } = useTranslation();
  const {
    clinicalEncounterUuid,
    formsList: { clinicalEncounterFormUuid },
  } = useConfig<ConfigObject>();

  const headerTitle = t('socialHistory', 'Social History');
  const handleOpenOrEditClinicalEncounterForm = (encounterUUID = '') => {
    launchPatientWorkspace('patient-form-entry-workspace', {
      workspaceTitle: 'Social History',
      mutateForm: mutate(
        (key) => typeof key === 'string' && key.startsWith('/openmrs/ws/rest/v1/kenyaemr/flags'),
        undefined,
        {
          revalidate: true,
        },
      ),
      formInfo: {
        encounterUuid: encounterUUID,
        formUuid: clinicalEncounterFormUuid,
        patientUuid,
        visitTypeUuid: '',
        visitUuid: '',
      },
    });
  };
  const tableHeader = [
    {
      key: 'encounterDate',
      header: t('encounterDate', 'Date'),
    },
    {
      key: 'alcoholUse',
      header: t('alcoholUse', 'Alcohol Use'),
    },
    {
      key: 'alcoholUseDuration',
      header: t('alcoholUseDuration', 'Alcohol Use Duration'),
    },
    {
      key: 'smoking',
      header: t('smoking', 'Smoking'),
    },
    {
      key: 'smokingDuration',
      header: t('smokingDuration', 'Smoking Duration'),
    },
    {
      key: 'otherSubstanceAbuse',
      header: t('otherSubstanceAbuse', 'Other Substance Abuse'),
    },
  ];
  const tableRows = encounters
    ?.map((encounter, index) => {
      const allFieldsNull = () => {
        return (
          getObsFromEncounter(encounter, Alcohol_Use_UUID) === '--' &&
          getObsFromEncounter(encounter, Alcohol_Use_Duration_UUID) === '--' &&
          getObsFromEncounter(encounter, Smoking_UUID) === '--' &&
          getObsFromEncounter(encounter, Smoking_Duration_UUID) === '--' &&
          getObsFromEncounter(encounter, Other_Substance_Abuse_UUID) === '--' &&
          encounter.encounterDatetime !== null
        );
      };
      if (allFieldsNull()) {
        return null;
      }
      return {
        id: `${encounter.uuid}`,
        encounterDate: formatDate(new Date(encounter.encounterDatetime)),
        alcoholUse: getObsFromEncounter(encounter, Alcohol_Use_UUID),
        alcoholUseDuration: getObsFromEncounter(encounter, Alcohol_Use_Duration_UUID),
        smoking: getObsFromEncounter(encounter, Smoking_UUID),
        smokingDuration: getObsFromEncounter(encounter, Smoking_Duration_UUID),
        otherSubstanceAbuse: getObsFromEncounter(encounter, Other_Substance_Abuse_UUID),
        actions: (
          <OverflowMenu aria-label="overflow-menu" flipped="false">
            <OverflowMenuItem
              onClick={() => handleOpenOrEditClinicalEncounterForm(encounter.uuid)}
              itemText={t('edit', 'Edit')}
            />
            <OverflowMenuItem itemText={t('delete', 'Delete')} isDelete />
          </OverflowMenu>
        ),
      };
    })
    .filter((row) => row !== null);
  if (isLoading) {
    return <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('socialHistory', 'Social History')} />;
  }
  if (encounters.length === 0) {
    return (
      <EmptyState
        displayText={t('clinicalEncounter', 'Clinical Encounter')}
        headerTitle={t('socialHistory', 'Social History')}
        launchForm={handleOpenOrEditClinicalEncounterForm}
      />
    );
  }
  return (
    <>
      <CardHeader title={headerTitle}>
        <Button
          size="md"
          kind="ghost"
          onClick={() => handleOpenOrEditClinicalEncounterForm()}
          renderIcon={(props) => <Add size={24} {...props} />}
          iconDescription="Add">
          {t('add', 'Add')}
        </Button>
      </CardHeader>
      <DataTable
        size="sm"
        rows={tableRows}
        headers={tableHeader}
        render={({ rows, headers, getHeaderProps, getRowProps, getTableProps, getTableContainerProps }) => (
          <TableContainer size="sm" {...getTableContainerProps()}>
            <Table size="sm" {...getTableProps()} aria-label="sample table">
              <TableHead>
                <TableRow>
                  {headers.map((header, i) => (
                    <TableHeader
                      key={i}
                      {...getHeaderProps({
                        header,
                      })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    {...getRowProps({
                      row,
                    })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />
    </>
  );
};
export default OutPatientSocialHistory;
