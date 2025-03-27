import { ScaleTypes, StackedBarChart, StackedBarChartOptions } from '@carbon/charts-react';
import { Layer } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './charts.scss';

type Props = {
  data: Array<{ group: string; key: string; value: number }>;
};

const BaseArtProgressTrackingChart: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();

  const options: StackedBarChartOptions = {
    title: t('progressInAdressingLinkedToArt', 'Progress in adressing Linkage to ART'),
    legend: {
      enabled: true,
    },
    axes: {
      bottom: {
        title: t('days', 'Days'),
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
        LinkedElsewere: '#00416a', //Dark Imperial Blue
        Dead: '#c46210', //Alloy Orange
        Denial: '#195905', //Lincoln Green
        Others: '#1e90ff', //Dodger Blue
        NotFound: '#8601af', //Violet (Ryb)
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

export default BaseArtProgressTrackingChart;
