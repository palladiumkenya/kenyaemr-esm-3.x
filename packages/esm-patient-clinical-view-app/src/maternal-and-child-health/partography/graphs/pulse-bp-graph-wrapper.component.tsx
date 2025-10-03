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
  Pagination,
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
  // ...existing code...
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

    if (item.time) {
      return item.time;
    }

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

  // Pagination logic
  const [internalPage, setInternalPage] = useState(currentPage);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);
  React.useEffect(() => {
    setInternalPage(currentPage);
  }, [currentPage]);
  React.useEffect(() => {
    setInternalPageSize(pageSize);
  }, [pageSize]);

  // Paginate tableData
  const paginatedTableData = tableData.slice((internalPage - 1) * internalPageSize, internalPage * internalPageSize);

  // Carbon DataTable headers
  const headers = [
    { key: 'dateTime', header: t('dateTime', 'Date & Time') },
    { key: 'pulse', header: t('pulse', 'Pulse (bpm)') },
    { key: 'bloodPressure', header: t('bloodPressure', 'Blood Pressure (mmHg)') },
    { key: 'pulseStatus', header: t('pulseStatus', 'Pulse Status') },
    { key: 'bpStatus', header: t('bpStatus', 'BP Status') },
  ];

  // Carbon DataTable rows
  const rows = paginatedTableData.map((item, index) => {
    const pulseStatus = getPulseStatus(item.pulse);
    const bpStatus = getBPStatus(item.systolicBP, item.diastolicBP);
    return {
      id: `${internalPage}-${index}`,
      dateTime: formatDateTime(item, index),
      pulse: item.pulse,
      bloodPressure: `${item.systolicBP}/${item.diastolicBP}`,
      pulseStatus: <Tag type={pulseStatus.type as any}>{pulseStatus.text}</Tag>,
      bpStatus: <Tag type={bpStatus.type as any}>{bpStatus.text}</Tag>,
    };
  });

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
              <>
                <TableContainer title="">
                  <DataTable rows={rows} headers={headers} isSortable={false}>
                    {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
                      <Table {...getTableProps()} size={controlSize} className={styles.dataTable}>
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader {...getHeaderProps({ header })} key={header.key}>
                                {header.header}
                              </TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow {...getRowProps({ row })} key={row.id}>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </DataTable>
                </TableContainer>
                <Pagination
                  page={internalPage}
                  pageSize={internalPageSize}
                  pageSizes={[5, 10, 20, 50]}
                  totalItems={totalItems}
                  onChange={({ page, pageSize }) => {
                    setInternalPage(page);
                    setInternalPageSize(pageSize);
                    onPageChange?.(page);
                    onPageSizeChange?.(pageSize);
                  }}
                  className={styles.pagination}
                />
              </>
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
