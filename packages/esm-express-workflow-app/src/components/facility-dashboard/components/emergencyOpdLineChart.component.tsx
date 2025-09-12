import React from 'react';
import { LegendPositions, LineChart, type LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import styles from './emergencyOpdLineChart.scss';

interface DashboardChartProps {
  data?: Array<{ value: number; day: string }>;
}

function DashboardChart({ data: emergencyOpdData }: DashboardChartProps) {
  const data =
    emergencyOpdData?.map((item) => ({
      group: 'Emergency Cases',
      date: item.day,
      value: item.value,
    })) ?? [];

  const options: LineChartOptions = {
    title: 'Emergency Cases',
    axes: {
      left: {
        mapsTo: 'value',
      },
      bottom: {
        scaleType: ScaleTypes.TIME,
        mapsTo: 'date',
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

export default DashboardChart;
