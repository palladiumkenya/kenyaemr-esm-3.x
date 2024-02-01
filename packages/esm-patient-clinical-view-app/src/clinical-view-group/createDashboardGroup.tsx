import React from 'react';
import { DashboardGroupExtension } from './dashboard-group.component';
import { usePatient } from '@openmrs/esm-framework';
import { useActivePatientEnrollment } from '@openmrs/esm-patient-common-lib';
import { evaluateExpression } from '../utils/expression-helper';

type DashboardGroupProps = {
  title: string;
  slotName: string;
  isExpanded?: boolean;
  isChild?: boolean;
  showWhenExpression?: string;
};

export const createDashboardGroup = ({
  title,
  slotName,
  isExpanded,
  isChild,
  showWhenExpression,
}: DashboardGroupProps) => {
  const DashboardGroup = ({ basePath }: { basePath: string }) => {
    const { patient, isLoading: isLoadingPatient } = usePatient();
    const { activePatientEnrollment, isLoading: isLoadingActiveEnrollment } = useActivePatientEnrollment(patient?.id);

    if (isLoadingPatient || isLoadingActiveEnrollment) {
      return null;
    }

    const showGroup = evaluateExpression(showWhenExpression, patient, activePatientEnrollment);
    if (!showGroup) {
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
  };
  return DashboardGroup;
};
