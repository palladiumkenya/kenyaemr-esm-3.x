import React, { useCallback, useMemo } from 'react';
import {
  InlineLoading,
  Button,
  DataTable,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  Tile,
  DataTableSkeleton,
} from '@carbon/react';
import { Close, DocumentAdd } from '@carbon/react/icons';
import {
  CardHeader,
  EmptyState,
  launchStartVisitPrompt,
  ErrorState,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { PatientCarePrograms, useCarePrograms } from '../hooks/useCarePrograms';
import { formatDate, restBaseUrl, useLayoutType, useVisit } from '@openmrs/esm-framework';
import capitalize from 'lodash/capitalize';
import { mutate } from 'swr';

import styles from './care-programs.scss';

type CareProgramsProps = {
  patientUuid: string;
};

const CarePrograms: React.FC<CareProgramsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { carePrograms, isLoading, isValidating, error, mutateEligiblePrograms } = useCarePrograms(patientUuid);
  const isTablet = useLayoutType() === 'tablet';

  const handleMutations = useCallback(() => {
    mutateEligiblePrograms();
    mutate(
      (key) =>
        typeof key === 'string' && key.startsWith(`${restBaseUrl}/kenyaemr/patientHistoricalEnrollment?patientUuid=`),
      undefined,
      { revalidate: true },
    );
    mutate(
      (key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/programenrollment?patient=${patientUuid}`),
      undefined,
      { revalidate: true },
    );
  }, [mutateEligiblePrograms, patientUuid]);

  const handleCareProgramClick = useCallback(
    (careProgram: PatientCarePrograms) => {
      const isEnrolled = careProgram.enrollmentStatus === 'active';
      const formUuid = isEnrolled ? careProgram.discontinuationFormUuid : careProgram.enrollmentFormUuid;

      const workspaceTitle = isEnrolled
        ? `${careProgram.display} Discontinuation form`
        : `${careProgram.display} Enrollment form`;

      currentVisit
        ? launchPatientWorkspace('patient-form-entry-workspace', {
            workspaceTitle: workspaceTitle,
            mutateForm: () => {
              handleMutations();
            },
            formInfo: {
              encounterUuid: '',
              formUuid,
              additionalProps: { enrollmenrDetails: careProgram.enrollmentDetails ?? {} },
            },
          })
        : launchStartVisitPrompt();
    },
    [currentVisit, handleMutations],
  );

  const rows = useMemo(
    () =>
      carePrograms.map((careProgram) => {
        return {
          id: `${careProgram.uuid}`,
          programName: careProgram.display,
          status: (
            <div className={styles.careProgramButtonContainer}>
              <span>
                {capitalize(
                  `${careProgram.enrollmentStatus} ${
                    careProgram.enrollmentDetails?.dateEnrolled && careProgram.enrollmentStatus === 'active'
                      ? `Since (${formatDate(new Date(careProgram.enrollmentDetails.dateEnrolled))})`
                      : ''
                  }`,
                )}
              </span>
              <Button
                size="sm"
                className="cds--btn--sm cds--layout--size-sm"
                kind={careProgram.enrollmentStatus == 'active' ? 'danger--ghost' : 'ghost'}
                iconDescription="Dismiss"
                onClick={() => handleCareProgramClick(careProgram)}
                renderIcon={careProgram.enrollmentStatus == 'active' ? Close : DocumentAdd}>
                {careProgram.enrollmentStatus == 'active' ? 'Discontinue' : 'Enroll'}
              </Button>
            </div>
          ),
        };
      }),
    [carePrograms, handleCareProgramClick],
  );

  const headers = [
    {
      key: 'programName',
      header: 'Program name',
    },
    {
      key: 'status',
      header: 'Status',
    },
  ];

  if (isLoading) {
    return <DataTableSkeleton headers={headers} aria-label={t('loading', 'Loading...')} />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorCarePrograms', 'Care programs')} error={error} />;
  }

  if (carePrograms.length === 0) {
    return <EmptyState headerTitle={t('careProgram', 'Care program')} displayText={t('careProgram', 'care program')} />;
  }

  return (
    <Tile className={styles.container}>
      <CardHeader title={t('carePrograms', 'Care Programs')}>
        {isValidating && (
          <InlineLoading
            status="active"
            iconDescription={t('validating', 'Loading')}
            description={t('validating', 'Validating data...')}
          />
        )}
      </CardHeader>
      <DataTable size={isTablet ? 'lg' : 'sm'} useZebraStyles rows={rows} headers={headers}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </Tile>
  );
};

export default CarePrograms;
