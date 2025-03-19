import { ScaleTypes, StackedBarChart, StackedBarChartOptions } from '@carbon/charts-react';
import { Layer } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './charts.scss';

type Props = {
  data: Array<{ group: string; key: string; value: number }>;
};

const BaseProgressTrackingChart: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();

  const options: StackedBarChartOptions = {
    title: t('progresstracking', 'Progress tracking'),
    legend: {
      enabled: true,
    },
    axes: {
      bottom: {
        title: t('weeks', 'Weeks'),
        mapsTo: 'key',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        title: t('percentage', 'Percentage'),
        mapsTo: 'value',
        scaleType: ScaleTypes.LINEAR,
        percentage: true,
      },
    },
    color: {
      scale: {
        Pending: '#ff0000', // Red color for Pending
        Completed: '#0000ff', // Blue color for Completed
      },
    },
    height: '400px',
    data: {
      groupMapsTo: 'group',
    },
  };

  return (
    <Layer className={styles.chartContainer}>
      <StackedBarChart options={options} data={data} />
    </Layer>
  );
};

export default BaseProgressTrackingChart;
