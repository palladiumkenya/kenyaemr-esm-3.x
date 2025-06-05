import React from 'react';
import styles from './print.scss';
import { useConfig } from '@openmrs/esm-framework';
import PatientSummaryBody from '../patient-summary/patient-summary-body.component';
import { type PatientSummary } from '../types';

const PrintComponent = React.forwardRef<HTMLDivElement, { data: PatientSummary }>(({ data }, ref) => {
  const { logo } = useConfig();
  return (
    <div ref={ref} className={styles.printPage}>
      {logo?.src && <img src={logo.src} alt={logo.alt || 'Logo'} width={110} height={40} />}
      <div className={styles.bodyContainer}>
        <div className={styles.card}>
          <PatientSummaryBody data={data} />
        </div>
      </div>
    </div>
  );
});

export default PrintComponent;
