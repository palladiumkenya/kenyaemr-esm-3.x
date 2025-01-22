import React, { useEffect, useState } from 'react';
import { BarChartOptions, GroupedBarChart, ScaleTypes } from '@carbon/charts-react';
import useClaimsAggregate from '../../../hooks/useClaimsAggregate';

const ClaimsSummaryChart = () => {
  const [metrics, setMetrics] = useState({ summaryGraph: [] });

  const { isLoading, summarizedData, error } = useClaimsAggregate();

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error loading claims data</div>;
  }

  useEffect(() => {
    if (summarizedData.length) {
      const transformedData = summarizedData.flatMap((item) => [
        { group: 'Claimed', month: item.month, value: item.claimedTotal },
        { group: 'Approved', month: item.month, value: item.approvedTotal },
      ]);

      setMetrics({ summaryGraph: transformedData });
    }
  }, [summarizedData]);

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
    <div style={{ padding: '2rem' }}>
      <GroupedBarChart data={metrics.summaryGraph} options={options} />
    </div>
  );
};

export default ClaimsSummaryChart;
