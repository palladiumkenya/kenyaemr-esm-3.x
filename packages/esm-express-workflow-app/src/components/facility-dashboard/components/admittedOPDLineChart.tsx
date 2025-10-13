import React from 'react';
import { LegendPositions, LineChart, type LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import styles from './admittedOPDLineChart.scss';

interface DashboardChartProps {
  opd?: {
    childrenUnder5: Array<{ day: string; value: number }>;
    over5YearsOld: Array<{ day: string; value: number }>;
  };
  admissions?: Array<{ value: number; day: string }>;
}

function AdmittedOPDLineChart({ opd: opd, admissions }: DashboardChartProps) {
  // Combine under5 and over5 into one data array
  const opdData = [...(opd?.childrenUnder5 ?? []), ...(opd?.over5YearsOld ?? [])].map((item) => ({
    group: 'OPD Visits',
    key: item.day,
    value: item.value,
  }));

  // Admissions data
  const admitted =
    admissions?.map((item) => ({
      group: 'Admissions',
      key: item.day,
      value: item.value,
    })) ?? [];

  // Merge both OPD and Admissions datasets
  const data = [...opdData, ...admitted];

  const options: LineChartOptions = {
    title: 'Admitted/OPD',
    axes: {
      left: {
        mapsTo: 'value',
        title: 'No. of Patients',
      },
      bottom: {
        scaleType: ScaleTypes.TIME,
        mapsTo: 'key',
      },
    },
    timeScale: {
      showDayName: true,
    },
    legend: {
      clickable: false,
      position: LegendPositions.TOP,
    },
    toolbar: {
      enabled: false,
    },
    height: '200px',
  };

  return (
    <div className={styles.chartContainer}>
      <LineChart data={data} options={options} />
    </div>
  );
}

export default AdmittedOPDLineChart;
