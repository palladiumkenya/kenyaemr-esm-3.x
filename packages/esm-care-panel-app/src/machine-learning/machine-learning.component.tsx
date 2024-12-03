import { ErrorState } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import usePatientHIVStatus from '../hooks/usePatientHIVStatus';
import CarePanelRiskScorePlot from '../iit-risk-score/iit-risk-score-plot';
import CarePanellIITRiskScore from '../iit-risk-score/iit-risk-score.component';
import styles from './machine-learning.scss';

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
    <div className={styles.machineLearning}>
      {!isPositive && (
        <EmptyState headerTitle={header} displayText={t('mlPredictions', 'machine learning predictions')} />
      )}
      {isPositive && <CarePanellIITRiskScore patientUuid={patientUuid} />}
      {isPositive && <CarePanelRiskScorePlot patientUuid={patientUuid} />}
    </div>
  );
};

export default CarePanelMachineLearning;
