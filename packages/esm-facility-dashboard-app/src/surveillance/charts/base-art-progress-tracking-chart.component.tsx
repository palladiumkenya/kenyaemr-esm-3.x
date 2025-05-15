import { ScaleTypes, StackedBarChart, StackedBarChartOptions } from '@carbon/charts-react';
import { Layer } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './charts.scss';
import { useChartDomain } from '../../hooks/useSurveillanceData';

type Props = {
  data: Array<{ group?: string; day: string; value: number }>;
  height?: string;
};

const BaseArtProgressTrackingChart: React.FC<Props> = ({ data, height = '400px' }) => {
  const { t } = useTranslation();

  const [minValue, maxValue] = useChartDomain(data);

  const options: StackedBarChartOptions = {
    title: t('progressInAddressingLinkedToArt', 'Progress in addressing Linkage to ART'),
    legend: {
      enabled: true,
    },
    axes: {
      bottom: {
        title: t('day', 'Day'),
        mapsTo: 'day',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        title: t('numberHivPositive', 'Number HIV positive'),
        mapsTo: 'value',
        scaleType: ScaleTypes.LINEAR,
        domain: [0, maxValue],
      },
    },
    color: {
      scale: {
        ContactedAndLinked: '#00416a', // Dark Imperial Blue
        ContactedButNotLinked: '#c46210', // Alloy Orange
        NotContacted: '#195905', // Lincoln Green
      },
    },
    height,
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
