import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList } from '@carbon/react';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { withUnit } from '@openmrs/esm-patient-common-lib';
import styles from './partograph-chart.scss';
import { LineChart } from '@carbon/charts-react';
import { PartograpyComponents } from '../../config-schema';

enum ScaleTypes {
  TIME = 'time',
  LINEAR = 'linear',
  LOG = 'log',
  LABELS = 'labels',
  LABELS_RATIO = 'labels-ratio',
}
interface PartographChartProps {
  partograpyComponents: Array<PartograpyComponents>;
}
interface PartographyChartData {
  title: string;
  value: string;
}
const PartographChart: React.FC<PartographChartProps> = ({ partograpyComponents }) => {
  const { t } = useTranslation();
  const [selectedPartographSign, setSelectedPartographSign] = React.useState<PartographyChartData>({
    title: `Fetal Heart Rate (${partograpyComponents[0]?.fetalHeartRate})`,
    value: 'fetalHeartRate',
  });
  const partographSigns = [
    {
      id: 'fetalHeartRate',
      title: withUnit('Heart Rate', partograpyComponents[0]?.fetalHeartRate.toString() ?? '-'),
      value: 'fetalHeartRate',
    },
    {
      id: 'cervicalDilation',
      title: withUnit('Cervical Dilation', partograpyComponents[0]?.cervicalDilation.toString() ?? '-'),
      value: 'cervicalDilation',
    },
    {
      id: 'descentOfHead',
      title: withUnit('Descent of Head', partograpyComponents[0]?.descentOfHead ?? '-'),
      value: 'descentOfHead',
    },
  ];
  function parseTodayDate(dateString: string): Date | null {
    const today = new Date();
    const todayFormatted = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    if (dateString.startsWith('Today')) {
      return new Date(`${todayFormatted} ${dateString.slice(6)}`);
    } else {
      return parseDate(dateString);
    }
  }

  const chartData = useMemo(() => {
    return partograpyComponents
      .filter((partography) => partography[selectedPartographSign.value])
      .splice(0, 10)
      .sort((partoDateA, partoDateB) => new Date(partoDateA.date).getTime() - new Date(partoDateB.date).getTime())
      .map((partoData) => {
        if (partoData[selectedPartographSign.value]) {
          if ('fetalHeartRate'.includes(selectedPartographSign.value)) {
            return [
              {
                group: 'Fetal Heart Rate',
                key: formatDate(parseTodayDate(partoData.date.toString()), { year: false }),
                value: partoData.fetalHeartRate,
                date: partoData.date,
              },
            ];
          } else {
            return {
              group: selectedPartographSign.title,
              key: formatDate(parseTodayDate(partoData.date.toString()), { year: false }),
              value: partoData[selectedPartographSign.value],
              date: partoData.date,
            };
          }
        }
      });
  }, [partograpyComponents, selectedPartographSign]);
  const chartOptions = {
    axes: {
      bottom: {
        title: 'Date',
        mapsTo: 'key',
        scaleType: ScaleTypes.LABELS,
      },
      left: {
        mapsTo: 'value',
        title: selectedPartographSign.title,
        scaleType: ScaleTypes.LINEAR,
        includeZero: false,
      },
    },
    legend: {
      enabled: false,
    },
    color: {
      scale: {
        [selectedPartographSign.title]: '#6929c4',
      },
    },
    tooltip: {
      customHTML: ([{ value, group, key }]) =>
        `<div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">${value} - ${String(
          group,
        ).toUpperCase()}
        <span style="color: #c6c6c6; font-size: 1rem; font-weight:600">${key}</span></div>`,
    },
    height: '400px',
  };

  return (
    <div className={styles.vitalsChartContainer}>
      <div className={styles.partographSignsArea}>
        <label className={styles.vitalsSignLabel} htmlFor="partography-chart-tab-group">
          {t('partographyDisplay', 'Partography Displayed')}
        </label>
        <Tabs className={styles.verticalTabs}>
          <TabList className={styles.tablist} aria-label="Partography  Data">
            {partographSigns.map(({ id, title, value }) => {
              return (
                <Tab
                  key={id}
                  className={`${styles.tab} ${styles.bodyLong01} ${
                    selectedPartographSign.title === title && styles.selectedTab
                  }`}
                  onClick={() =>
                    setSelectedPartographSign({
                      title: title,
                      value: value,
                    })
                  }>
                  {title}-
                </Tab>
              );
            })}
          </TabList>
        </Tabs>
      </div>
      <div className={styles.vitalsChartArea}>
        <LineChart data={chartData.flat()} options={chartOptions} />
      </div>
    </div>
  );
};

export default PartographChart;
