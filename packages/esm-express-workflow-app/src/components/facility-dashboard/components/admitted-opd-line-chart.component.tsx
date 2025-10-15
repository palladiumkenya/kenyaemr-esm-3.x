import React from 'react';
import { LegendPositions, LineChart, type LineChartOptions, ScaleTypes } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { useTranslation } from 'react-i18next';
import { red60, blue60 } from '@carbon/colors';

interface DashboardChartProps {
  opd?: {
    childrenUnder5: Array<{ day: string; value: number }>;
    over5YearsOld: Array<{ day: string; value: number }>;
  };
  admissions?: Array<{ value: number; day: string }>;
}

function AdmittedOPDLineChart({ opd: opd, admissions }: DashboardChartProps) {
  const { t } = useTranslation();
  // Aggregate OPD data by day (sum childrenUnder5 + over5YearsOld)
  const opdByDay = new Map<string, number>();

  opd?.childrenUnder5?.forEach((item) => {
    opdByDay.set(item.day, (opdByDay.get(item.day) || 0) + item.value);
  });

  opd?.over5YearsOld?.forEach((item) => {
    opdByDay.set(item.day, (opdByDay.get(item.day) || 0) + item.value);
  });

  const opdData = Array.from(opdByDay.entries())
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([day, value]) => ({
      group: 'OPD Visits',
      key: day,
      value,
    }));

  // Admissions data
  const admitted =
    admissions
      ?.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      ?.map((item) => ({
        group: 'Admissions',
        key: item.day,
        value: item.value,
      })) ?? [];

  // Merge both OPD and Admissions datasets
  const data = [...opdData, ...admitted];
  const options: LineChartOptions = {
    title: t('Admitted/OPD', 'Admitted/OPD Visits'),
    axes: {
      left: {
        mapsTo: 'value',
        title: 'No. of Patients',
      },
      bottom: {
        scaleType: ScaleTypes.TIME,
        mapsTo: 'key',
      },
    },
    timeScale: {
      showDayName: true,
    },
    legend: {
      clickable: false,
      position: LegendPositions.TOP,
      alignment: 'right',
    },

    toolbar: {
      enabled: false,
    },
    color: {
      scale: {
        Admissions: red60, // Red for critical/urgent admissions
        'OPD Visits': blue60, // Blue for regular outpatient visits
      },
    },
    height: '200px',
  };

  return (
    <div>
      <LineChart data={data} options={options} />
    </div>
  );
}

export default AdmittedOPDLineChart;
