import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from '@carbon/charts-react';
import styles from '../partography.scss';
import { getColorForGraph } from '../types';

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
        formatter: (index: number) => '',
      },
    },
    left: {
      title: 'Pulse',
      mapsTo: 'value',
      domain: [0, 260],
      ticks: {
        values: [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260],
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
  height: '600px',
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
      numberOfTicks: 14,
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

  const formatDateTime = (item: PulseBPData, index: number): string => {
    if (item.timestamp) {
      return item.timestamp.toLocaleDateString() + ' ' + item.timestamp.toLocaleTimeString();
    }
    if (item.date && item.time) {
      return `${item.date} ${item.time}`;
    }
    if (item.date) {
      return item.date;
    }
    if (item.time) {
      return item.time;
    }
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
  };

  const actualData: PulseBPData[] = data.length > 0 ? data : [];

  const pulseChartData: ChartDataPoint[] = [];

  if (actualData.length > 0) {
    actualData.forEach((item, index) => {
      pulseChartData.push({
        index: index,
        value: item.pulse,
        group: 'Pulse',
      });
    });
  } else {
    pulseChartData.push({ index: 0, value: 120, group: 'Pulse' });
  }

  const finalChartData = [...pulseChartData];

  const chartOptions = {
    ...PULSE_BP_CHART_OPTIONS,
    title: 'Pulse and Blood Pressure Monitoring',
    color: {
      scale: {
        Pulse: actualData.length > 0 ? getColorForGraph('blue') : 'transparent',
      },
    },
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
                const chartMarginTop = 5;
                const chartMarginBottom = 8;
                const chartMarginLeft = 3.59;
                const chartMarginRight = 8;
                const chartWidth = 100 - chartMarginLeft - chartMarginRight;
                const chartHeight = 100 - chartMarginTop - chartMarginBottom;
                const dataPointIndex = index;
                const bpXPosition = chartMarginLeft + ((dataPointIndex + 0) / 12) * chartWidth;
                const yOffset = 23;
                const yOffsetDiastolic = 40;
                const pulseYPosition = chartMarginTop + yOffset + ((260 - item.pulse) / 260) * (chartHeight - yOffset);
                const systolicYPosition =
                  chartMarginTop + yOffset + ((260 - item.systolicBP) / 260) * (chartHeight - yOffset);
                const diastolicYPosition =
                  chartMarginTop +
                  yOffsetDiastolic +
                  ((260 - item.diastolicBP) / 260) * (chartHeight - yOffsetDiastolic);

                const greenArrowStartY = Math.min(pulseYPosition, diastolicYPosition);
                const greenArrowEndY = Math.max(pulseYPosition, diastolicYPosition);

                return (
                  <g key={index}>
                    <defs>
                      <marker
                        id={`systolic-arrow-${index}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="5"
                        refY="5"
                        orient="auto"
                        markerUnits="strokeWidth">
                        <polygon points="0,0 10,5 0,10 3,5" fill={getColorForGraph('red')} />
                      </marker>
                      <marker
                        id={`diastolic-arrow-${index}`}
                        markerWidth="10"
                        markerHeight="10"
                        refX="5"
                        refY="5"
                        orient="auto"
                        markerUnits="strokeWidth">
                        <polygon points="0,10 10,5 0,0 3,5" fill={getColorForGraph('green')} />
                      </marker>
                    </defs>

                    <line
                      x1={`${bpXPosition}%`}
                      y1={`${pulseYPosition}%`}
                      x2={`${bpXPosition}%`}
                      y2={`${systolicYPosition}%`}
                      stroke={getColorForGraph('red')}
                      strokeWidth="2"
                      markerEnd={`url(#systolic-arrow-${index})`}
                    />

                    <line
                      x1={`${bpXPosition}%`}
                      y1={`${pulseYPosition}%`}
                      x2={`${bpXPosition}%`}
                      y2={`${diastolicYPosition}%`}
                      stroke={getColorForGraph('green')}
                      strokeWidth="2"
                      markerEnd={`url(#diastolic-arrow-${index})`}
                    />

                    <circle
                      cx={`${bpXPosition}%`}
                      cy={`${systolicYPosition}%`}
                      r="3"
                      fill={getColorForGraph('red')}
                      opacity="0.8">
                      <title>
                        {formatDateTime(item, index)} - Systolic BP: {item.systolicBP} mmHg
                      </title>
                    </circle>

                    <circle
                      cx={`${bpXPosition}%`}
                      cy={`${diastolicYPosition}%`}
                      r="3"
                      fill={getColorForGraph('green')}
                      opacity="0.8">
                      <title>
                        {formatDateTime(item, index)} - Diastolic BP: {item.diastolicBP} mmHg
                      </title>
                    </circle>

                    <circle
                      cx={`${bpXPosition}%`}
                      cy={`${pulseYPosition}%`}
                      r="4"
                      fill={getColorForGraph('blue')}
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
