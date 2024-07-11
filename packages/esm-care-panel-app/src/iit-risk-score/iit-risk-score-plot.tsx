import { LineChart, LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import React from 'react';
import styles from './iit-risk-score.scss';
import usePatientIITScore from '../hooks/usePatientIITScore';
import { CardHeader } from '@openmrs/esm-patient-common-lib';

interface CarePanelRiskScorePlotProps {
  patientUuid: string;
}

const CarePanelRiskScorePlot: React.FC<CarePanelRiskScorePlotProps> = ({ patientUuid }) => {
  const data = [
    {
      date: '2019-01-01T00:00:00.000Z',
      value: 5,
    },
    {
      date: '2022-01-05T00:00:00.000Z',
      value: 7,
    },
    {
      date: '2022-01-08T00:00:00.000Z',
      value: 10,
    },
    {
      date: '2023-01-13T00:00:00.000Z',
      value: 30,
    },
    {
      date: '2023-01-23T00:00:00.000Z',
      value: 23,
    },
    {
      date: '2024-01-17T00:00:00.000Z',
      value: 12,
    },
    {
      date: '2024-06-17T00:00:00.000Z',
      value: 2,
    },
  ];
  const { isLoading, error, riskScore } = usePatientIITScore(patientUuid);
  const options: LineChartOptions = {
    title: 'KenyaHMIS ML Model',
    legend: { enabled: false },
    axes: {
      bottom: {
        title: 'Evaluation Time',
        mapsTo: 'date',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: 'value',
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
        {riskScore.riskScore}
      </center>
      <div style={{ padding: '1rem' }}>
        <LineChart data={data} options={options} />
      </div>
    </div>
  );
};

export default CarePanelRiskScorePlot;
