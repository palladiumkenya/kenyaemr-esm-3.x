import React, { useEffect, useState } from 'react';
import { BarChartOptions, GroupedBarChart, ScaleTypes } from '@carbon/charts-react';

const ClaimsSummaryChart = () => {
  const [metrics, setMetrics] = useState({ summaryGraph: [] });

  useEffect(() => {
    setTimeout(() => {
      // Simulating API data fetch
      const data = {
        summaryGraph: [
          { month: 'January', claimsA: 1200, claimsB: 1000 },
          { month: 'February', claimsA: 1000, claimsB: 1100 },
          { month: 'March', claimsA: 1400, claimsB: 1300 },
          { month: 'April', claimsA: 800, claimsB: 700 },
          { month: 'May', claimsA: 1100, claimsB: 1200 },
        ],
      };

      setMetrics(data);
    }, 1000); // Simulating async fetch
  }, []);

  if (!metrics.summaryGraph.length) {
    return <div>Loading data...</div>;
  }

  const transformClaimSummaryChartData = (data) => {
    return data.map((item) => [
      { group: item.month, value: item.claimsA },
      { group: item.month, value: item.claimsB },
    ]).flat();
  };

  const options: BarChartOptions = {
    title: 'Claims Comparative Analysis',
    legend: {
      enabled: true,
    },
    axes: {
      left: {
        title: 'Month',
        mapsTo: 'group',
        scaleType: ScaleTypes.LABELS,
      },
      bottom: {
        title: 'Amount (Ksh)',
        mapsTo: 'value',

        scaleType: ScaleTypes.LINEAR,
        includeZero: true,
      },
    },
    height: '400px',
  };

 
  const transformedData = transformClaimSummaryChartData(metrics.summaryGraph);

  return (
    <div style={{ padding: '2rem' }}>
      <GroupedBarChart
        data={transformedData}
        options={options}
      />
    </div>
  );
};

export default ClaimsSummaryChart;