import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListSkeleton } from '@carbon/react';
import { usePatientSummary } from '../hooks/usePatientSummary';
import { useReactToPrint } from 'react-to-print';
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Patient Summary',
    onAfterPrint: () => {
      setShowPrintComponent(false);
    },
  });

  const onPrintClick = () => {
    setShowPrintComponent(true);
  };

  useEffect(() => {
    if (showPrintComponent && printRef.current) {
      handlePrint?.();
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
