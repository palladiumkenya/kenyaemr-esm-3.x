import React from 'react';
import { ScaleTypes, SimpleBarChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import './dataTable.scss';

interface TopDiseasesBarChartsProps {
  data?: Array<{ day: string; group: string; value: number; ageGroup: 'under5' | 'over5' }>;
}

export function TopDiseasesBarCharts({ data: topDiseases }: TopDiseasesBarChartsProps) {
  const under5Data =
    topDiseases
      ?.filter((item) => item.ageGroup === 'under5')
      .map((item) => ({ group: item.group, value: item.value })) ?? [];

  const over5Data =
    topDiseases
      ?.filter((item) => item.ageGroup === 'over5')
      .map((item) => ({ group: item.group, value: item.value })) ?? [];

  const chartOptions = {
    axes: {
      left: {
        mapsTo: 'value',
        title: 'No. of Patients',
        ticks: {
          formatter: (tick) => (Number.isInteger(tick) ? tick : null),
        },
      },
      bottom: {
        mapsTo: 'group',
        title: 'Diseases',
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
            title: 'Top 10 Diseases under 5',
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <SimpleBarChart
          data={over5Data}
          options={{
            ...chartOptions,
            title: 'Top 10 Diseases over 5',
          }}
        />
      </div>
    </div>
  );
}
