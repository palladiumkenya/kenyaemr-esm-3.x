import { LineChart, LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import React from 'react';
import styles from './iit-risk-score.scss';
import usePatientIITScore from '../hooks/usePatientIITScore';
import { CardHeader } from '@openmrs/esm-patient-common-lib';
import { patientRiskScore } from './risk-score.mock';
import { formatDate, parseDate } from '@openmrs/esm-framework';

interface CarePanelRiskScorePlotProps {
  patientUuid: string;
}

const CarePanelRiskScorePlot: React.FC<CarePanelRiskScorePlotProps> = ({ patientUuid }) => {
  const { isLoading, error, riskScore } = usePatientIITScore(patientUuid);
  const options: LineChartOptions = {
    title: 'KenyaHMIS ML Model',
    legend: { enabled: false },
    axes: {
      bottom: {
        title: 'Evaluation Time',
        mapsTo: 'evaluationDate',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: 'riskScore',
        title: 'Risk Score (%)',
        percentage: true,
        scaleType: ScaleTypes.LINEAR,
      },
    },
    curve: 'curveMonotoneX',
    height: '400px',
  };
  return (
    <div className={styles['risk-score-card']}>
      <span className={styles.sectionHeader}>IIT Risk Score Trend</span>
      <center>
        <strong>Latest risk score: </strong>
        {`${riskScore.riskScore}%`}
      </center>
      <div style={{ padding: '1rem' }}>
        <LineChart
          data={patientRiskScore.map((risk) => ({
            ...risk,
            evaluationDate: formatDate(parseDate(risk.evaluationDate)),
          }))}
          options={options}
        />
      </div>
    </div>
  );
};

export default CarePanelRiskScorePlot;
