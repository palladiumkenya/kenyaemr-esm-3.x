import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabsVertical, TabListVertical, TabPanels, TabPanel } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import styles from './partograph-chart.scss';

interface PartographyComponent {
  date: string;
  fetalHeartRate?: number;
  cervicalDilation?: number;
  descentOfHead?: string | number;
  [key: string]: any;
}

interface PartographChartProps {
  partograpyComponents: PartographyComponent[];
}

interface PartographSignOption {
  id: string;
  title: string;
  value: keyof PartographyComponent;
}

enum ScaleTypes {
  TIME = 'time',
  LINEAR = 'linear',
  LOG = 'log',
  LABELS = 'labels',
  LABELS_RATIO = 'labels-ratio',
}

const PartographChart: React.FC<PartographChartProps> = ({ partograpyComponents }) => {
  const { t } = useTranslation();

  const processedPartographData = useMemo(() => {
    return partograpyComponents.map((item) => {
      const processedItem = { ...item };

      if (typeof item.descentOfHead === 'string' && item.descentOfHead.includes('/')) {
        const [numerator, denominator] = item.descentOfHead.split('/').map(Number);
        processedItem.descentOfHead = denominator !== 0 ? (numerator / denominator) * 10 : 10;
      }

      return processedItem;
    });
  }, [partograpyComponents]);

  const getFormattedValue = (value: any): string => {
    if (value === undefined || value === null) {
      return '-';
    }
    return value.toString();
  };

  const partographSignOptions = useMemo<PartographSignOption[]>(() => {
    const firstValidItem = processedPartographData.find(
      (item) =>
        item.fetalHeartRate !== undefined || item.cervicalDilation !== undefined || item.descentOfHead !== undefined,
    );

    const fetalHeartRate = firstValidItem?.fetalHeartRate;
    const cervicalDilation = firstValidItem?.cervicalDilation;
    const descentOfHead = firstValidItem?.descentOfHead;

    return [
      {
        id: 'fetalHeartRate',
        title: `Heart Rate (${getFormattedValue(fetalHeartRate)})`,
        value: 'fetalHeartRate',
      },
      {
        id: 'cervicalDilation',
        title: `Cervical Dilation (${getFormattedValue(cervicalDilation)})`,
        value: 'cervicalDilation',
      },
      {
        id: 'descentOfHead',
        title: `Descent of Head (${getFormattedValue(descentOfHead)})`,
        value: 'descentOfHead',
      },
    ];
  }, [processedPartographData]);

  const [selectedPartographSign, setSelectedPartographSign] = useState<PartographSignOption>(partographSignOptions[0]);

  const chartData = useMemo(() => {
    if (!processedPartographData.length) {
      return [];
    }

    return processedPartographData
      .filter((item) => item[selectedPartographSign.value] !== undefined)
      .slice(0, 10)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        group: selectedPartographSign.title,
        value: item[selectedPartographSign.value],
        date: item.date,
      }));
  }, [processedPartographData, selectedPartographSign]);

  const chartOptions = useMemo(
    () => ({
      title: t('partoGraphtChartTitle', 'PartoGraph Chart'),
      axes: {
        bottom: {
          title: t('time', 'Time'),
          mapsTo: 'date',
          scaleType: ScaleTypes.TIME,
        },
        left: {
          mapsTo: 'value',
          title: selectedPartographSign.title,
          scaleType: ScaleTypes.LINEAR,
          includeZero: false,
        },
      },
      curve: 'curveMonotoneX',
      height: '400px',
      tooltip: {
        customHTML: ([{ value, group }]: any) => `
        <div class="cds--tooltip cds--tooltip--shown" style="min-width: max-content; font-weight:600">
          ${value} - ${String(group).toUpperCase()}
          <span style="color: #c6c6c6; font-size: 1rem; font-weight:600">${group}</span>
        </div>
      `,
      },
    }),
    [t, selectedPartographSign.title],
  );

  const handleTabSelect = (option: PartographSignOption) => {
    setSelectedPartographSign(option);
  };

  React.useEffect(() => {
    const currentOption = partographSignOptions.find((option) => option.id === selectedPartographSign.id);
    // Update to the new option or default to the first option
    setSelectedPartographSign(currentOption || partographSignOptions[0]);
  }, [partographSignOptions, selectedPartographSign.id]);

  return (
    <div className={styles.vitalsChartContainer}>
      <div className={styles.partographSignsArea}>
        <label className={styles.vitalsSignLabel} htmlFor="partography-chart-tab-group">
          {t('partographyDisplay', 'Partography Displayed')}
        </label>
        <TabsVertical height="">
          <TabListVertical>
            {partographSignOptions.map((option) => (
              <Tab
                key={option.id}
                className={`${styles.tab} ${styles.bodyLong01} ${
                  selectedPartographSign.id === option.id ? styles.selectedTab : ''
                }`}
                onClick={() => handleTabSelect(option)}>
                {option.title}
              </Tab>
            ))}
          </TabListVertical>

          <TabPanels>
            {partographSignOptions.map(({ id, title, value }) => (
              <TabPanel key={id}>
                <LineChart data={chartData.flat()} options={chartOptions} />
              </TabPanel>
            ))}
          </TabPanels>
        </TabsVertical>
      </div>
    </div>
  );
};

export default PartographChart;
