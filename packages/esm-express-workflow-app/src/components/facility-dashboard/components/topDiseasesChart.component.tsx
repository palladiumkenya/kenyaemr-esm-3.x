import React from 'react';
import { ScaleTypes, SimpleBarChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import './dataTable.scss';

interface TopDiseasesChartProps {
  data?: Array<{ day: string; group: string; value: number }>;
}

export function TopDiseasesChart({ data: topDiseases }: TopDiseasesChartProps) {
  const data = topDiseases?.map((item) => ({ group: item.group, value: item.value })) ?? [];

  const options = {
    title: 'Top Diseases',
    axes: {
      left: {
        mapsTo: 'value',
        title: 'No. of Patients',
        ticks: {
          // ✅ Always show whole numbers
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

  return <SimpleBarChart data={data} options={options} />;
}
