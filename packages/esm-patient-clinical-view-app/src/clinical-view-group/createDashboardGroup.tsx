import React, { memo, useMemo } from 'react';
import { DashboardGroupExtension } from './dashboard-group.component';
import { usePatient } from '@openmrs/esm-framework';
import { evaluateExpression } from '../utils/expression-helper';
import { usePatientEnrollment } from './clinical-view-group.resource';

type DashboardGroupProps = {
  title: string;
  slotName: string;
  isExpanded?: boolean;
  isChild?: boolean;
  showWhenExpression?: string;
  basePath?: string;
};

const DashboardGroup = memo(
  ({ title, slotName, isExpanded, isChild, basePath, showWhenExpression }: DashboardGroupProps) => {
    const { patient, isLoading: isLoadingPatient } = usePatient();
    const { patientEnrollments, isLoading: isLoadingActiveEnrollment } = usePatientEnrollment(patient?.id);

    const showGroup = useMemo(
      () => evaluateExpression(showWhenExpression, patient, patientEnrollments),
      [showWhenExpression, patient, patientEnrollments],
    );

    if (isLoadingPatient || isLoadingActiveEnrollment || !showGroup) {
      return null;
    }

    return (
      <DashboardGroupExtension
        key={basePath}
        isChild={isChild}
        title={title}
        slotName={slotName}
        basePath={basePath}
        isExpanded={isExpanded}
      />
    );
  },
);

export const createDashboardGroup = ({
  title,
  slotName,
  isExpanded,
  isChild,
  showWhenExpression,
}: DashboardGroupProps) => {
  return ({ basePath, ...rest }) => (
    <DashboardGroup
      basePath={basePath}
      title={title}
      slotName={slotName}
      isExpanded={isExpanded}
      isChild={isChild}
      showWhenExpression={showWhenExpression}
      {...rest}
    />
  );
};
