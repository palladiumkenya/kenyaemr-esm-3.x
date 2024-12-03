import { LineChart, LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import usePatientIITScore from '../hooks/usePatientIITScore';
import styles from './iit-risk-score.scss';
import { patientRiskScore } from './risk-score.mock';
import { useTranslation } from 'react-i18next';

interface CarePanelRiskScorePlotProps {
  patientUuid: string;
}

const CarePanelRiskScorePlot: React.FC<CarePanelRiskScorePlotProps> = ({ patientUuid }) => {
  const { isLoading, error, riskScore } = usePatientIITScore(patientUuid);
  const { t } = useTranslation();
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
        includeZero: true,
      },
    },
    curve: 'curveMonotoneX',
    height: '400px',
    tooltip: {
      // Tooltip configuration for displaying descriptions
      enabled: true,

      valueFormatter(value, label) {
        if (label === 'Risk Score (%)') {
          return `${value} (${patientRiskScore.find((r) => `${r.riskScore}` === `${value}`)?.description ?? ''})`;
        }
        return `${value}`;
      },
    },
  };

  return (
    <div className={styles.riskScoreCard}>
      <span className={styles.sectionHeader}>{t('iitRiskScoreTrend', 'IIT Risk Score Trend')}</span>
      <center>
        <strong>{t('latestRiskScore', 'Latest risk score')}: </strong>
        {`${riskScore?.riskScore} (${riskScore?.description})`}
      </center>
      <div style={{ padding: '1rem' }}>
        <LineChart
          data={
            riskScore?.riskScore && !riskScore?.riskScore.includes('-')
              ? [
                  {
                    evaluationDate: riskScore.evaluationDate,
                    riskScore: Number(riskScore?.riskScore?.split('%')[0]?.trim()),
                    description: riskScore?.description,
                    riskFactors: riskScore?.riskFactors,
                  },
                ]
              : []
          }
          options={options}
        />
      </div>
    </div>
  );
};

export default CarePanelRiskScorePlot;
