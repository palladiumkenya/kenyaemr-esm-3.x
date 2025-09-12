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
import { ErrorState } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib/src';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatientPrograms } from '../mch.resource';

type ProgramsProps = {
  patientUuid: string;
};
const Programs: React.FC<ProgramsProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const title = t('programManagement', 'Program Management');
  const { allPrograms, enrolledPrograms, error, isLoading, unenrolledPrograms } = usePatientPrograms(patientUuid);

  if (isLoading) return <StructuredListSkeleton rowCount={5} />;
  if (error) return <ErrorState headerTitle={title} error={error} />;
  if (!allPrograms.length) return <EmptyState displayText={t('programs', 'Programs')} headerTitle={title} />;

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
        {enrolledPrograms.map((enrollment) => (
          <StructuredListRow key={enrollment.uuid}>
            <StructuredListCell>{enrollment.program.name}</StructuredListCell>
            <StructuredListCell>
              <Tag type="green" renderIcon={Checkmark}>
                Enrolled
              </Tag>
            </StructuredListCell>
            <StructuredListCell>
              <OverflowMenu aria-label="overflow-menu">
                <OverflowMenuItem
                  itemText={t('launchProgramForm', 'Lauch {{program}} Form', { program: enrollment.program.name })}
                />
                <OverflowMenuItem itemText={t('edit', 'Edit')} />
                <OverflowMenuItem itemText={t('discontinue', 'Discontinue')} />
              </OverflowMenu>
            </StructuredListCell>
          </StructuredListRow>
        ))}
        {/* None Enroled */}
        {unenrolledPrograms.map((program) => (
          <StructuredListRow key={program.uuid}>
            <StructuredListCell>{program.name}</StructuredListCell>
            <StructuredListCell></StructuredListCell>
            <StructuredListCell>
              <Button renderIcon={Add} size="xs" kind="ghost">
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
