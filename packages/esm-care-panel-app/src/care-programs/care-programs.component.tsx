import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Tile,
} from '@carbon/react';
import { Close, DocumentAdd } from '@carbon/react/icons';
import { formatDate, launchWorkspace, restBaseUrl, useLayoutType, useVisit } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import capitalize from 'lodash/capitalize';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { PatientCarePrograms, useCarePrograms } from '../hooks/useCarePrograms';

import {
  getProgramForms,
  launchDeleteProgramDialog,
  launchProgramForm,
  usePatientEnrolledPrograms,
} from './care-program.resource';
import styles from './care-programs.scss';

type CareProgramsProps = {
  patientUuid: string;
};

const CarePrograms: React.FC<CareProgramsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { eligibleCarePrograms, isLoading, isValidating, error, mutateEligiblePrograms } = useCarePrograms(patientUuid);
  const {
    enrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
    mutate: mutateEnrollments,
  } = usePatientEnrolledPrograms(patientUuid);
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
        ? launchWorkspace('patient-form-entry-workspace', {
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
    () => [
      ...enrollments.map((enrollment) => {
        const forms = getProgramForms(enrollment.program.uuid);

        return {
          id: enrollment.program.uuid,
          programName: enrollment.program.name,
          status: (
            <div className={styles.careProgramButtonContainer}>
              <Tag type="green">Enrolled</Tag>
              <OverflowMenu aria-label="overflow-menu" flipped>
                {forms.map((form) => (
                  <OverflowMenuItem
                    key={form.formUuId}
                    itemText={form.formName}
                    onClick={() => {
                      currentVisit
                        ? launchWorkspace('patient-form-entry-workspace', {
                            workspaceTitle: form.formName,
                            mutateForm: () => {
                              mutateEnrollments();
                              mutateEligiblePrograms();
                            },
                            formInfo: {
                              encounterUuid: '',
                              formUuid: form.formUuId,
                              // additionalProps: { enrollmenrDetails: careProgram.enrollmentDetails ?? {} },
                            },
                          })
                        : launchStartVisitPrompt();
                    }}
                  />
                ))}
                <OverflowMenuItem
                  itemText={t('edit', 'Edit')}
                  onClick={() =>
                    launchProgramForm(enrollment.program.uuid, patientUuid, enrollment, () => mutateEnrollments())
                  }
                />
                <OverflowMenuItem
                  itemText={t('delete', 'Delete')}
                  onClick={() => launchDeleteProgramDialog(enrollment.uuid, patientUuid)}
                />
              </OverflowMenu>
            </div>
          ),
        };
      }),
      ...eligibleCarePrograms.map((careProgram) => {
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
                // onClick={() => handleCareProgramClick(careProgram)}
                onClick={() =>
                  launchProgramForm(careProgram.uuid, patientUuid, undefined, () => {
                    mutateEnrollments();
                    mutateEligiblePrograms();
                  })
                }
                renderIcon={careProgram.enrollmentStatus == 'active' ? Close : DocumentAdd}>
                {careProgram.enrollmentStatus == 'active' ? 'Discontinue' : 'Enroll'}
              </Button>
            </div>
          ),
        };
      }),
    ],
    [enrollments, eligibleCarePrograms, t, currentVisit, mutateEnrollments, patientUuid, mutateEligiblePrograms],
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

  if (eligibleCarePrograms.length === 0) {
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
