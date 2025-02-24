import React, { useEffect, useState } from 'react';
import { BarChartOptions, GroupedBarChart, ScaleTypes } from '@carbon/charts-react';
import useClaimsAggregate from '../../../hooks/useClaimsAggregate';

interface MetricData {
  summaryGraph: { group: string; month: string; value: number }[];
}

const ClaimsSummaryChart = () => {
  const [metrics, setMetrics] = useState<MetricData>({ summaryGraph: [] });

  const { isLoading, summarizedData, error } = useClaimsAggregate();

  useEffect(() => {
    if (summarizedData?.length) {
      const transformedData = summarizedData.flatMap((item) => [
        { group: 'Claimed', month: item.month, value: item.claimedTotal },
        { group: 'Approved', month: item.month, value: item.approvedTotal },
      ]);
      setMetrics({ summaryGraph: transformedData });
    }
  }, [summarizedData]);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error loading claims data: {error.message}</div>;
  }

  const options: BarChartOptions = {
    title: 'Analysis of Claimed vs Approved Amount by Month',
    legend: {
      enabled: true,
    },
    axes: {
      left: {
        mapsTo: 'month',
        title: 'Month',
        scaleType: ScaleTypes.LABELS,
      },
      bottom: {
        mapsTo: 'value',
        title: 'Amount (Ksh)',
        scaleType: ScaleTypes.LINEAR,
        includeZero: true,
      },
    },
    height: '400px',
  };

  return (
    <div style={{ padding: '2rem' }} aria-label="Claims Summary Chart">
      <GroupedBarChart data={metrics.summaryGraph} options={options} />
    </div>
  );
};

export default ClaimsSummaryChart;
