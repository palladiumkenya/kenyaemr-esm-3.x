import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from '@carbon/charts-react';
import styles from '../partography.scss';

export interface PulseBPData {
  pulse: number;
  systolicBP: number;
  diastolicBP: number;
  index?: number;
  date?: string;
  time?: string;
  timestamp?: Date;
}

interface ChartDataPoint {
  index: number;
  group: string;
  value: number;
}

interface PulseBPGraphProps {
  data: PulseBPData[];
}

enum ScaleTypes {
  LABELS = 'labels',
  LINEAR = 'linear',
}

const PULSE_BP_CHART_OPTIONS = {
  axes: {
    bottom: {
      title: '',
      mapsTo: 'index',
      scaleType: ScaleTypes.LINEAR,
      domain: [0, 12],
      ticks: {
        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        formatter: (index: number) => '', // Remove x-axis labels
      },
    },
    left: {
      title: 'Pulse',
      mapsTo: 'value',
      domain: [60, 180],
      ticks: {
        values: [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180],
        formatter: (value: number) => `${value}`,
      },
      scaleType: ScaleTypes.LINEAR,
    },
  },
  points: {
    enabled: true,
    radius: 4,
    filled: true,
  },
  curve: 'curveLinear',
  height: '400px',
  theme: 'white',
  toolbar: {
    enabled: false,
  },
  legend: {
    position: 'top',
    clickable: false,
  },
  grid: {
    x: {
      enabled: true,
      numberOfTicks: 13,
    },
    y: {
      enabled: true,
      numberOfTicks: 13,
    },
  },
  zoomBar: {
    top: {
      enabled: false,
    },
  },
};

const PulseBPGraph: React.FC<PulseBPGraphProps> = ({ data }) => {
  const { t } = useTranslation();

  // Helper function to format date/time for display
  const formatDateTime = (item: PulseBPData, index: number): string => {
    // If we have a timestamp, use it
    if (item.timestamp) {
      return item.timestamp.toLocaleDateString() + ' ' + item.timestamp.toLocaleTimeString();
    }

    // If we have separate date and time, combine them
    if (item.date && item.time) {
      return `${item.date} ${item.time}`;
    }

    // If we only have date
    if (item.date) {
      return item.date;
    }

    // If we only have time
    if (item.time) {
      return item.time;
    }

    // Fallback to current date/time for new entries
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  };

  // Use actual data from props, no sample data
  const actualData: PulseBPData[] = data.length > 0 ? data : [];

  // Always show the chart, even if empty
  // Transform pulse data for chart - start from y-axis intersection like cervix graph
  const pulseChartData: ChartDataPoint[] = [];

  // If we have data, add starting point at y-axis and then actual data points
  if (actualData.length > 0) {
    // Add starting point at y-axis (index 0) using first pulse value
    pulseChartData.push({ index: 0, value: actualData[0].pulse, group: 'Pulse' });

    // Add all actual data points
    actualData.forEach((item, index) => {
      pulseChartData.push({
        index: index + 1, // Start from position 1, 2, 3, etc.
        value: item.pulse,
        group: 'Pulse',
      });
    });
  } else {
    // For empty chart, add a minimal invisible data point to ensure chart renders with proper structure
    pulseChartData.push({ index: 0, value: 120, group: 'Pulse' });
  }

  // Use pulse data for the chart line (will show grid even if empty)
  const finalChartData = [...pulseChartData];

  // Chart options similar to cervix graph
  const chartOptions = {
    ...PULSE_BP_CHART_OPTIONS,
    title: 'Pulse and Blood Pressure Monitoring',
    color: {
      scale: {
        Pulse: actualData.length > 0 ? '#0F62FE' : 'transparent', // Hide line if no real data
      },
    },
    // Hide points if no real data
    points: {
      enabled: actualData.length > 0,
      radius: 4,
      filled: true,
    },
  };

  return (
    <div className={styles.pulseBPGraph}>
      <div className={styles.chartContainer} data-chart-id="pulse-bp">
        <div style={{ position: 'relative' }}>
          <LineChart data={finalChartData} options={chartOptions} />

          {/* Single SVG overlay for all arrows and lines - only show if we have actual data */}
          {actualData.length > 0 && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5,
              }}>
              {actualData.map((item, index) => {
                // More precise positioning to match Carbon Chart's actual rendering
                // Fine-tuned margins to match Carbon Charts internal layout exactly
                const chartMarginTop = 20; // Increased for title and legend space
                const chartMarginBottom = 10; // Bottom margin for x-axis
                const chartMarginLeft = 12; // Adjusted for y-axis labels (more precise)
                const chartMarginRight = 5; // Right margin

                // Calculate chart area dimensions
                const chartWidth = 100 - chartMarginLeft - chartMarginRight;
                const chartHeight = 100 - chartMarginTop - chartMarginBottom;

                // X position: Since we start from index 1 in chart data,
                // we need to position our SVG overlay at the same x-coordinate as the actual chart points
                const dataPointIndex = index + 1; // This matches the chart data index
                const xPosition = chartMarginLeft + (dataPointIndex / 12) * chartWidth;

                // For BP arrows, offset them slightly to align on same vertical axis as pulse
                // Using x-1 approach: move BP indicators one grid unit to the left
                const gridUnit = chartWidth / 12; // Size of one grid unit
                const bpXPosition = chartMarginLeft + ((dataPointIndex - 1) / 12) * chartWidth;

                // Y positions based on value mapping to chart scale (60-180 range)
                const pulseYPosition = chartMarginTop + ((180 - item.pulse) / (180 - 60)) * chartHeight;
                const systolicYPosition = chartMarginTop + ((180 - item.systolicBP) / (180 - 60)) * chartHeight;
                const diastolicYPosition = chartMarginTop + ((180 - item.diastolicBP) / (180 - 60)) * chartHeight;

                return (
                  <g key={index}>
                    {/* Arrow definitions - fixed orientation */}
                    <defs>
                      <marker
                        id={`systolic-arrow-${index}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="5"
                        refY="5"
                        orient="auto"
                        markerUnits="strokeWidth">
                        <polygon points="0,0 10,5 0,10 3,5" fill="#DA1E28" />
                      </marker>
                      <marker
                        id={`diastolic-arrow-${index}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="5"
                        refY="5"
                        orient="auto"
                        markerUnits="strokeWidth">
                        <polygon points="0,0 10,5 0,10 3,5" fill="#198038" />
                      </marker>
                    </defs>

                    {/* Systolic arrow line - ALWAYS points upward from pulse to systolic value */}
                    <line
                      x1={`${bpXPosition}%`}
                      y1={`${pulseYPosition}%`}
                      x2={`${bpXPosition}%`}
                      y2={`${systolicYPosition}%`}
                      stroke="#DA1E28"
                      strokeWidth="2"
                      markerEnd={`url(#systolic-arrow-${index})`}
                    />

                    {/* Diastolic arrow line - ALWAYS points downward from pulse to diastolic value */}
                    <line
                      x1={`${bpXPosition}%`}
                      y1={`${pulseYPosition}%`}
                      x2={`${bpXPosition}%`}
                      y2={`${diastolicYPosition}%`}
                      stroke="#198038"
                      strokeWidth="2"
                      markerEnd={`url(#diastolic-arrow-${index})`}
                    />

                    {/* Marker circles at exact BP values for precise indication */}
                    <circle cx={`${bpXPosition}%`} cy={`${systolicYPosition}%`} r="3" fill="#DA1E28" opacity="0.8">
                      <title>
                        {formatDateTime(item, index)} - Systolic BP: {item.systolicBP} mmHg
                      </title>
                    </circle>

                    <circle cx={`${bpXPosition}%`} cy={`${diastolicYPosition}%`} r="3" fill="#198038" opacity="0.8">
                      <title>
                        {formatDateTime(item, index)} - Diastolic BP: {item.diastolicBP} mmHg
                      </title>
                    </circle>

                    {/* Pulse point indicator - aligned with BP arrows for neat vertical layout */}
                    <circle
                      cx={`${bpXPosition}%`}
                      cy={`${pulseYPosition}%`}
                      r="4"
                      fill="#0F62FE"
                      stroke="#fff"
                      strokeWidth="1"
                      opacity="0.9">
                      <title>
                        {formatDateTime(item, index)} - Pulse: {item.pulse} bpm
                      </title>
                    </circle>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default PulseBPGraph;
