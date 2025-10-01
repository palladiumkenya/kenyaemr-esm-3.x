import {
  Button,
  OverflowMenu,
  OverflowMenuItem,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListSkeleton,
  StructuredListWrapper,
  Tag,
} from '@carbon/react';
import { Add, Checkmark } from '@carbon/react/icons';
import { ErrorState, launchWorkspace, showModal, useVisit } from '@openmrs/esm-framework';
import { EmptyState, FormEntryProps, launchStartVisitPrompt } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Enrollement, Program } from '../mch.resource';
import { getProgramForms, usePatientPrograms } from './programs.resource';

type ProgramsProps = {
  patientUuid: string;
};

type FormProps = {
  mutateForm: () => void;
  formInfo: FormEntryProps;
  clinicalFormsWorkspaceName?: string;
};
const Programs: React.FC<ProgramsProps> = ({ patientUuid }) => {
  const { currentVisit } = useVisit(patientUuid);

  const { t } = useTranslation();
  const title = t('programManagement', 'Program Management');
  const { allPrograms, enrolledPrograms, error, isLoading, unenrolledPrograms, mutate, unenrolledEligiblePrograms } =
    usePatientPrograms(patientUuid);

  const launchDeleteProgramDialog = useCallback(
    (programEnrollmentId: string) => {
      const dispose = showModal('program-delete-confirmation-modal', {
        closeDeleteModal: () => dispose(),
        programEnrollmentId,
        patientUuid,
        size: 'sm',
      });
    },
    [patientUuid],
  );

  const launchProgramForm = (program: Program, enrollment?: Enrollement) => {
    launchWorkspace('mch-program-form-workspace', {
      workspaceTitle: t('programForm', 'Program Form'),
      enrollment,
      patientUuid,
      program,
      onSubmitSuccess: () => mutate(),
    });
  };

  if (isLoading) {
    return <StructuredListSkeleton rowCount={5} />;
  }
  if (error) {
    return <ErrorState headerTitle={title} error={error} />;
  }
  if (!allPrograms.length) {
    return <EmptyState displayText={t('programs', 'Programs')} headerTitle={title} />;
  }

  return (
    <StructuredListWrapper selectedInitialRow="row-2" selection>
      <StructuredListHead>
        <StructuredListRow head>
          <StructuredListCell head>{t('Programs', 'Programs')}</StructuredListCell>
          <StructuredListCell head></StructuredListCell>
          <StructuredListCell head>Actions</StructuredListCell>
        </StructuredListRow>
      </StructuredListHead>
      <StructuredListBody>
        {/* Enrolled */}
        {enrolledPrograms.map((enrollment) => {
          const forms = getProgramForms(enrollment.program.uuid);
          return (
            <StructuredListRow key={enrollment.uuid}>
              <StructuredListCell>{enrollment.program.name}</StructuredListCell>
              <StructuredListCell>
                <Tag type="green" renderIcon={Checkmark}>
                  Enrolled
                </Tag>
              </StructuredListCell>
              <StructuredListCell>
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
                                mutate();
                              },
                              formInfo: {
                                encounterUuid: '',
                                formUuid: form.formUuId,
                                // additionalProps: { enrollmenrDetails: careProgram.enrollmentDetails ?? {} },
                              },
                            } as FormProps)
                          : launchStartVisitPrompt();
                      }}
                    />
                  ))}
                  <OverflowMenuItem
                    itemText={t('edit', 'Edit')}
                    onClick={() => launchProgramForm(enrollment.program, enrollment)}
                  />
                  <OverflowMenuItem
                    itemText={t('delete', 'Delete')}
                    onClick={() => launchDeleteProgramDialog(enrollment.uuid)}
                  />
                </OverflowMenu>
              </StructuredListCell>
            </StructuredListRow>
          );
        })}
        {/* None Enroled */}
        {unenrolledPrograms.map((program) => (
          <StructuredListRow key={program.uuid}>
            <StructuredListCell>{program.display}</StructuredListCell>
            <StructuredListCell></StructuredListCell>
            <StructuredListCell>
              <Button renderIcon={Add} size="xs" kind="ghost" onClick={() => launchProgramForm(program)}>
                Enroll
              </Button>
            </StructuredListCell>
          </StructuredListRow>
        ))}
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

export default Programs;
