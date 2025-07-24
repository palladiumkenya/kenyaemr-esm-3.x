import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton } from '@carbon/react';
import { usePatientSummary } from '../hooks/usePatientSummary';
import PrintComponent from '../print-layout/print.component';
import PatientSummaryHeader from './patient-summary-header.component';
import PatientSummaryBody from './patient-summary-body.component';
import styles from './patient-summary.scss';

interface PatientSummaryProps {
  patientUuid: string;
}

const PatientSummary: React.FC<PatientSummaryProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { data, error, isLoading } = usePatientSummary(patientUuid);

  const printRef = useRef<HTMLDivElement>(null);
  const [showPrintComponent, setShowPrintComponent] = useState(false);

  const handlePrint = useCallback(async () => {
    try {
      // TODO: use backend to generate the print content
      if (printRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const printContent = printRef.current.innerHTML;
          printWindow.document.documentElement.innerHTML = printContent;
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      // Fallback to browser print
      window.print();
    }
  }, []);

  const onPrintClick = () => {
    setShowPrintComponent(true);
  };

  useEffect(() => {
    if (showPrintComponent && printRef.current) {
      // Use setTimeout to ensure the component is fully rendered
      setTimeout(() => {
        handlePrint();
        setShowPrintComponent(false);
      }, 100);
    }
  }, [showPrintComponent, handlePrint]);

  if (isLoading) {
    return <StructuredListSkeleton />;
  }
  if (error) {
    return <span>{t('errorPatientSummary', 'Error loading patient summary')}</span>;
  }
  if (!data || Object.keys(data).length === 0) {
    return <span>{t('noPatientSummary', 'No patient summary available')}</span>;
  }

  return (
    <>
      {showPrintComponent && (
        <div style={{ position: 'absolute', left: '-9999px' }}>
          <PrintComponent ref={printRef} data={data} />
        </div>
      )}

      <div className={styles.bodyContainer}>
        <div className={styles.card}>
          <PatientSummaryHeader onPrint={onPrintClick} printMode={false} />
          <PatientSummaryBody data={data} />
        </div>
      </div>
    </>
  );
};

export default PatientSummary;
