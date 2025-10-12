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
        formatter: (index: number) => '',
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
    pulseChartData.push({ index: 0, value: actualData[0].pulse, group: 'Pulse' });
    actualData.forEach((item, index) => {
      pulseChartData.push({
        index: index + 1,
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
        Pulse: actualData.length > 0 ? '#0F62FE' : 'transparent',
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
                const chartMarginTop = 20;
                const chartMarginBottom = 10;
                const chartMarginLeft = 12;
                const chartMarginRight = 5;

                const chartWidth = 100 - chartMarginLeft - chartMarginRight;
                const chartHeight = 100 - chartMarginTop - chartMarginBottom;

                const dataPointIndex = index + 1;
                const xPosition = chartMarginLeft + (dataPointIndex / 12) * chartWidth;

                const gridUnit = chartWidth / 12;
                const bpXPosition = chartMarginLeft + ((dataPointIndex - 1) / 12) * chartWidth;

                const pulseYPosition = chartMarginTop + ((180 - item.pulse) / (180 - 60)) * chartHeight;
                const systolicYPosition = chartMarginTop + ((180 - item.systolicBP) / (180 - 60)) * chartHeight;
                const diastolicYPosition = chartMarginTop + ((180 - item.diastolicBP) / (180 - 60)) * chartHeight;

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

                    <line
                      x1={`${bpXPosition}%`}
                      y1={`${pulseYPosition}%`}
                      x2={`${bpXPosition}%`}
                      y2={`${systolicYPosition}%`}
                      stroke="#DA1E28"
                      strokeWidth="2"
                      markerEnd={`url(#systolic-arrow-${index})`}
                    />

                    <line
                      x1={`${bpXPosition}%`}
                      y1={`${pulseYPosition}%`}
                      x2={`${bpXPosition}%`}
                      y2={`${diastolicYPosition}%`}
                      stroke="#198038"
                      strokeWidth="2"
                      markerEnd={`url(#diastolic-arrow-${index})`}
                    />

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
