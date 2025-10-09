import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
} from '@carbon/react';
import { Add, ChartColumn, Table as TableIcon } from '@carbon/react/icons';
import PulseBPGraph, { PulseBPData } from './pulse-bp-graph.component';
import PulseBPForm from '../forms/pulse-bp-form.component';
import styles from '../partography.scss';

interface PulseBPGraphWrapperProps {
  data: PulseBPData[];
  tableData?: Array<{
    pulse: number;
    systolicBP: number;
    diastolicBP: number;
    date?: string;
    time?: string;
    timestamp?: Date;
  }>;
  viewMode?: 'graph' | 'table';
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  controlSize?: 'sm' | 'md' | 'lg';
  onAddData?: () => void;
  onViewModeChange?: (mode: 'graph' | 'table') => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isAddButtonDisabled?: boolean;
  patient?: {
    uuid: string;
    name: string;
    gender: string;
    age: string;
  };
  onPulseBPSubmit?: (data: { pulse: number; systolicBP: number; diastolicBP: number }) => void;
}

const PulseBPGraphWrapper: React.FC<PulseBPGraphWrapperProps> = ({
  data = [],
  tableData = [],
  viewMode = 'graph',
  currentPage = 1,
  pageSize = 5,
  totalItems = 0,
  controlSize = 'sm',
  onAddData,
  onViewModeChange,
  onPageChange,
  onPageSizeChange,
  isAddButtonDisabled = false,
  patient,
  onPulseBPSubmit,
}) => {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Helper function to format date/time for table display
  const formatDateTime = (item: any, index: number): string => {
    // If we have a timestamp, use it
    if (item.timestamp) {
      return (
        item.timestamp.toLocaleDateString() +
        ' ' +
        item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
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
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddData = () => {
    setIsFormOpen(true);
    onAddData?.();
  };

  const handleFormSubmit = (formData: { pulse: number; systolicBP: number; diastolicBP: number }) => {
    onPulseBPSubmit?.(formData);
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  // Function to get pulse status
  const getPulseStatus = (pulse: number): { type: string; text: string } => {
    if (isNaN(pulse)) {
      return { type: 'gray', text: 'Invalid' };
    }

    if (pulse < 60) {
      return { type: 'warm-gray', text: 'Low' };
    } else if (pulse >= 60 && pulse <= 100) {
      return { type: 'green', text: 'Normal' };
    } else {
      return { type: 'red', text: 'Abnormal' };
    }
  };

  // Function to get BP status
  const getBPStatus = (systolic: number, diastolic: number): { type: string; text: string } => {
    if (isNaN(systolic) || isNaN(diastolic)) {
      return { type: 'gray', text: 'Invalid' };
    }

    if (systolic > 149 || diastolic > 80) {
      return { type: 'red', text: 'High' };
    } else if (systolic <= 90 || diastolic <= 60) {
      return { type: 'warm-gray', text: 'Low' };
    } else {
      return { type: 'green', text: 'Normal' };
    }
  };

  return (
    <div className={styles.fetalHeartRateSection}>
      <div className={styles.fetalHeartRateContainer}>
        <div className={styles.fetalHeartRateHeader}>
          <div className={styles.fetalHeartRateTitle}>
            <h3 className={styles.fetalHeartRateHeading}>{t('pulseAndBP', 'Pulse & BP')}</h3>
            <div className={styles.fetalHeartRateControls}>
              {/* Pulse indicators */}
              <Tag type="warm-gray" title="Low Pulse">
                Low(&lt;60)
              </Tag>
              <Tag type="green" title="Normal Pulse">
                Normal(60-100)
              </Tag>
              <Tag type="red" title="Abnormal Pulse">
                Abnormal(&gt;100)
              </Tag>
              {/* BP indicators */}
              <Tag type="warm-gray" title="Low BP">
                Low(S≤90 or D≤60)
              </Tag>
              <Tag type="green" title="Normal BP">
                Normal(90&lt;S&lt;149 and 60&lt;D&lt;80)
              </Tag>
              <Tag type="red" title="High BP">
                High(S≥149 or D≥80)
              </Tag>
            </div>
          </div>
          <div className={styles.fetalHeartRateControls}>
            <div className={styles.viewToggle}>
              <Button
                kind={viewMode === 'graph' ? 'primary' : 'secondary'}
                size={controlSize}
                hasIconOnly
                iconDescription={t('graphView', 'Graph View')}
                onClick={() => onViewModeChange?.('graph')}
                className={styles.viewButton}>
                <ChartColumn />
              </Button>
              <Button
                kind={viewMode === 'table' ? 'primary' : 'secondary'}
                size={controlSize}
                hasIconOnly
                iconDescription={t('tableView', 'Table View')}
                onClick={() => onViewModeChange?.('table')}
                className={styles.viewButton}>
                <TableIcon />
              </Button>
            </div>
            <Button
              kind="primary"
              size={controlSize}
              renderIcon={Add}
              iconDescription="Add pulse and BP data"
              disabled={isAddButtonDisabled}
              onClick={handleAddData}
              className={styles.addButton}>
              Add
            </Button>
          </div>
        </div>

        {viewMode === 'graph' ? (
          <PulseBPGraph data={data} />
        ) : (
          <div className={styles.tableContainer}>
            {tableData && tableData.length > 0 ? (
              <div className={styles.pulseBPTable}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>{t('dateTime', 'Date & Time')}</th>
                      <th>{t('pulse', 'Pulse (bpm)')}</th>
                      <th>{t('bloodPressure', 'Blood Pressure (mmHg)')}</th>
                      <th>{t('pulseStatus', 'Pulse Status')}</th>
                      <th>{t('bpStatus', 'BP Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((item, index) => {
                      const pulseStatus = getPulseStatus(item.pulse);
                      const bpStatus = getBPStatus(item.systolicBP, item.diastolicBP);
                      return (
                        <tr key={index}>
                          <td>{formatDateTime(item, index)}</td>
                          <td>{item.pulse}</td>
                          <td>
                            {item.systolicBP}/{item.diastolicBP}
                          </td>
                          <td>
                            <Tag type={pulseStatus.type as any}>{pulseStatus.text}</Tag>
                          </td>
                          <td>
                            <Tag type={bpStatus.type as any}>{bpStatus.text}</Tag>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyTable}>
                <p>{t('noPulseBPData', 'No pulse and BP data available')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pulse and BP Form */}
      <PulseBPForm isOpen={isFormOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} patient={patient} />
    </div>
  );
};

export default PulseBPGraphWrapper;
