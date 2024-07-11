import React from 'react';
import styles from './machine-learning.scss';
import CarePanellIITRiskScore from '../iit-risk-score/iit-risk-score.component';
import CarePanelRiskScorePlot from '../iit-risk-score/iit-risk-score-plot';
import usePatientHIVStatus from '../hooks/usePatientHIVStatus';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@openmrs/esm-patient-common-lib';

interface CarePanelMachineLearningProps {
  patientUuid: string;
}

const CarePanelMachineLearning: React.FC<CarePanelMachineLearningProps> = ({ patientUuid }) => {
  const { error, isLoading, isPositive } = usePatientHIVStatus(patientUuid);
  const { t } = useTranslation();
  const header = t('machineLearning', 'Machine Learning');
  if (error) {
    return <ErrorState error={error} headerTitle={header} />;
  }
  return (
    <div className={styles['machine-learning']}>
      {!isPositive && <EmptyState headerTitle={header} displayText="machine learning predictions" />}
      {isPositive && <CarePanellIITRiskScore patientUuid={patientUuid} />}
      {isPositive && <CarePanelRiskScorePlot patientUuid={patientUuid} />}
    </div>
  );
};

export default CarePanelMachineLearning;
