import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart } from '@carbon/charts-react';
import styles from '../partography.scss';
import { getColorForGraph, SVG_NAMESPACE } from '../types';

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
      domain: [0, 20],
      ticks: {
        values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
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
      numberOfTicks: 21,
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

  const actualData: PulseBPData[] = React.useMemo(() => (data.length > 0 ? data : []), [data]);

  const pulseChartData: ChartDataPoint[] = [];

  if (actualData.length > 0) {
    actualData.forEach((item, index) => {
      pulseChartData.push({
        index: index,
        value: item.pulse,
        group: 'Pulse-Line',
      });
    });
    actualData.forEach((item, index) => {
      pulseChartData.push({
        index: index,
        value: item.systolicBP,
        group: 'Systolic-Points',
      });
      pulseChartData.push({
        index: index,
        value: item.diastolicBP,
        group: 'Diastolic-Points',
      });
    });
  } else {
    pulseChartData.push({ index: 0, value: 120, group: 'Pulse-Line' });
  }

  const finalChartData = [...pulseChartData];
  const colorScale: { [key: string]: string } = {
    'Pulse-Line': actualData.length > 0 ? getColorForGraph('blue') : 'transparent',
    'Systolic-Points': 'transparent',
    'Diastolic-Points': 'transparent',
  };

  const chartOptions = {
    ...PULSE_BP_CHART_OPTIONS,
    title: 'Pulse and Blood Pressure Monitoring',
    color: {
      scale: colorScale,
    },
    points: {
      enabled: actualData.length > 0,
      radius: 5,
      filled: true,
      strokeWidth: 2,
    },
    legend: {
      position: 'top',
      clickable: false,
      enabled: false,
    },
    tooltip: {
      showTotal: false,
      customHTML: (data: any) => {
        if (data && data.length > 0) {
          const point = data[0];
          // Just return the value - clean and simple
          return `<div style="background: #333; color: white; padding: 8px; border-radius: 4px; font-size: 14px; border: none;">
            ${point.value}
          </div>`;
        }
        return '';
      },
    },
  };

  useEffect(() => {
    let observer: MutationObserver | null = null;
    const addXMarker = (svg: SVGElement, cx: number, cy: number) => {
      const size = 4;
      const systolicColor = '#da1e28';
      const line1 = document.createElementNS(SVG_NAMESPACE, 'line');
      line1.setAttribute('x1', (cx - size).toString());
      line1.setAttribute('y1', (cy + size).toString());
      line1.setAttribute('x2', cx.toString());
      line1.setAttribute('y2', (cy - size).toString());
      line1.setAttribute('stroke', systolicColor);
      line1.setAttribute('stroke-width', '3');
      line1.setAttribute('stroke-linecap', 'round');
      line1.setAttribute('data-custom-marker', 'systolic-inverted-v');

      const line2 = document.createElementNS(SVG_NAMESPACE, 'line');
      line2.setAttribute('x1', cx.toString());
      line2.setAttribute('y1', (cy - size).toString());
      line2.setAttribute('x2', (cx + size).toString());
      line2.setAttribute('y2', (cy + size).toString());
      line2.setAttribute('stroke', systolicColor);
      line2.setAttribute('stroke-width', '3');
      line2.setAttribute('stroke-linecap', 'round');
      line2.setAttribute('data-custom-marker', 'systolic-inverted-v');

      svg.appendChild(line1);
      svg.appendChild(line2);
    };

    const addVMarker = (svg: SVGElement, cx: number, cy: number) => {
      const size = 4;
      const vColor = '#24a148';

      const line1 = document.createElementNS(SVG_NAMESPACE, 'line');
      line1.setAttribute('x1', (cx - size).toString());
      line1.setAttribute('y1', (cy - size).toString());
      line1.setAttribute('x2', cx.toString());
      line1.setAttribute('y2', (cy + size).toString());
      line1.setAttribute('stroke', vColor);
      line1.setAttribute('stroke-width', '3');
      line1.setAttribute('stroke-linecap', 'round');
      line1.setAttribute('data-custom-marker', 'diastolic-v');

      const line2 = document.createElementNS(SVG_NAMESPACE, 'line');
      line2.setAttribute('x1', cx.toString());
      line2.setAttribute('y1', (cy + size).toString());
      line2.setAttribute('x2', (cx + size).toString());
      line2.setAttribute('y2', (cy - size).toString());
      line2.setAttribute('stroke', vColor);
      line2.setAttribute('stroke-width', '3');
      line2.setAttribute('stroke-linecap', 'round');
      line2.setAttribute('data-custom-marker', 'diastolic-v');

      svg.appendChild(line1);
      svg.appendChild(line2);
    };

    const addVerticalConnector = (svg: SVGElement, x: number, y1: number, y2: number, color: string) => {
      const line = document.createElementNS(SVG_NAMESPACE, 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('data-custom-marker', 'vertical-connector');

      svg.appendChild(line);
    };

    const addCustomMarkers = () => {
      const chartContainer = document.querySelector(`[data-chart-id="pulse-bp"]`);
      if (chartContainer && actualData.length > 0) {
        const svg = chartContainer.querySelector('svg');
        if (!svg) {
          return;
        }

        svg.querySelectorAll('[data-custom-marker]').forEach((marker) => marker.remove());

        const circles = svg.querySelectorAll('circle');

        circles.forEach((circle, index) => {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          const cy = parseFloat(circle.getAttribute('cy') || '0');
          const fill = circle.getAttribute('fill') || circle.style.fill || '';
          const stroke = circle.getAttribute('stroke') || circle.style.stroke || '';
          const className = circle.getAttribute('class') || '';
        });

        const allXPositions = Array.from(circles)
          .map((circle) => {
            return parseFloat(circle.getAttribute('cx') || '0');
          })
          .filter((x) => x > 0)
          .sort((a, b) => a - b);

        const uniqueXPositions: number[] = [];
        allXPositions.forEach((x) => {
          if (uniqueXPositions.length === 0 || Math.abs(x - uniqueXPositions[uniqueXPositions.length - 1]) > 20) {
            uniqueXPositions.push(x);
          }
        });

        uniqueXPositions.forEach((xPos, timeIndex) => {
          const circlesAtThisX = Array.from(circles).filter((circle) => {
            const cx = parseFloat(circle.getAttribute('cx') || '0');
            return Math.abs(cx - xPos) < 15;
          });
          if (circlesAtThisX.length === 0) {
            return;
          }
          circlesAtThisX.sort((a, b) => {
            const aY = parseFloat(a.getAttribute('cy') || '0');
            const bY = parseFloat(b.getAttribute('cy') || '0');
            return aY - bY;
          });

          circlesAtThisX.forEach((circle, idx) => {
            const cx = parseFloat(circle.getAttribute('cx') || '0');
            const cy = parseFloat(circle.getAttribute('cy') || '0');
          });
          let pulseY: number | null = null;
          let systolicY: number | null = null;
          let diastolicY: number | null = null;

          circlesAtThisX.forEach((circle, circleIndex) => {
            const cx = parseFloat(circle.getAttribute('cx') || '0');
            const cy = parseFloat(circle.getAttribute('cy') || '0');
            if (circlesAtThisX.length >= 3) {
              if (circleIndex === 0) {
                systolicY = cy;
                addXMarker(svg, cx, cy);
                circle.style.opacity = '0';
              } else if (circleIndex === circlesAtThisX.length - 1) {
                diastolicY = cy;
                addVMarker(svg, cx, cy);
                circle.style.opacity = '0';
              } else {
                pulseY = cy;
              }
            } else if (circlesAtThisX.length === 2) {
              if (circleIndex === 0) {
                pulseY = cy;
              } else {
                diastolicY = cy;
                addVMarker(svg, cx, cy);
                circle.style.opacity = '0';
              }
            } else if (circlesAtThisX.length === 1) {
              pulseY = cy;
            }
          });
          const currentX = circlesAtThisX[0] ? parseFloat(circlesAtThisX[0].getAttribute('cx') || '0') : 0;

          if (pulseY !== null && systolicY !== null) {
            addVerticalConnector(svg, currentX, pulseY, systolicY, '#da1e28'); // Red line to systolic
          }

          if (pulseY !== null && diastolicY !== null) {
            addVerticalConnector(svg, currentX, pulseY, diastolicY, '#24a148'); // Green line to diastolic
          }
        });
      }
    };
    const timer = setTimeout(addCustomMarkers, 500);
    const timer2 = setTimeout(addCustomMarkers, 1000);
    const chartContainer = document.querySelector(`[data-chart-id="pulse-bp"]`);
    if (chartContainer && window.MutationObserver) {
      observer = new MutationObserver(() => {
        setTimeout(addCustomMarkers, 100);
      });
      observer.observe(chartContainer, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [actualData]);

  return (
    <div className={styles.pulseBPGraph}>
      <div className={styles.chartContainer} data-chart-id="pulse-bp">
        <LineChart data={finalChartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PulseBPGraph;
