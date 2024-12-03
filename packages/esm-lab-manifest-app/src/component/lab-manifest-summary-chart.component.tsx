import { BarChartOptions, GroupedBarChart, ScaleTypes } from '@carbon/charts-react';
import React from 'react';
import { useLabManifestMetrics } from '../hooks';
import { transformManifestSummaryChartData } from '../lab-manifest.resources';

const LabManifestSummaryChart = () => {
  const { error, isLoading, metrics } = useLabManifestMetrics();

  if (error) {
    return null;
  }

  const options: BarChartOptions = {
    title: 'Average Turn Around Time',
    legend: {
      enabled: true,
    },
    axes: {
      left: {
        title: 'Month',
        mapsTo: 'month',
        scaleType: ScaleTypes.LABELS,
      },
      bottom: {
        mapsTo: 'value',
        title: 'Turn around time (Days)',
        scaleType: ScaleTypes.LINEAR,
        includeZero: true,
      },
    },
    height: '400px',
  };

  return (
    <div style={{ padding: '2rem' }}>
      <GroupedBarChart
        data={isLoading ? [] : transformManifestSummaryChartData(metrics.summaryGraph)}
        options={options}
      />
    </div>
  );
};

export default LabManifestSummaryChart;
