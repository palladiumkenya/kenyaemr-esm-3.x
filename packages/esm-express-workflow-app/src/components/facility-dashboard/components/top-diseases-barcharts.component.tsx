import React from 'react';
import { ScaleTypes, SimpleBarChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import './top-diseases-barcharts.scss';
import { useTranslation } from 'react-i18next';

interface TopDiseasesBarChartsProps {
  data?: Array<{ day: string; group: string; value: number; ageGroup: 'under5' | 'over5' }>;
}

const AGE_GROUPS = {
  UNDER_5: 'under5',
  OVER_5: 'over5',
} as const;

export function TopDiseasesBarCharts({ data: topDiseases }: TopDiseasesBarChartsProps) {
  const { t } = useTranslation();
  const under5Data =
    topDiseases
      ?.filter((item) => item.ageGroup === AGE_GROUPS.UNDER_5)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item) => ({ group: item.group, value: item.value })) ?? [];

  const over5Data =
    topDiseases
      ?.filter((item) => item.ageGroup === AGE_GROUPS.OVER_5)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((item) => ({ group: item.group, value: item.value })) ?? [];

  const chartOptions = {
    axes: {
      left: {
        mapsTo: 'value',
        title: t('noOfPatients', 'No. of Patients'),
        ticks: {
          formatter: (tick) => (Number.isInteger(tick) ? tick : null),
        },
      },
      bottom: {
        mapsTo: 'group',
        title: t('diseases', 'Diseases'),
        scaleType: ScaleTypes.LABELS,
      },
    },
    toolbar: {
      enabled: false,
    },
    legend: { enabled: false },
    height: '200px',
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
      <div style={{ flex: 1 }}>
        <SimpleBarChart
          data={under5Data}
          options={{
            ...chartOptions,
            title: t('top10DiseasesUnder5', 'Top 10 Diseases under 5'),
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <SimpleBarChart
          data={over5Data}
          options={{
            ...chartOptions,
            title: t('top10DiseasesOver5', 'Top 10 Diseases over 5'),
          }}
        />
      </div>
    </div>
  );
}
