import React, { useRef } from 'react';
import styles from './print.scss';
import { useConfig } from '@openmrs/esm-framework';

export function PrintComponent() {
  const componentRef = useRef(null);
  const { logo } = useConfig();

  return (
    <div className={styles.printPage}>
      <div ref={componentRef}>{logo?.src ? <img src={logo.src} alt={logo?.alt} width={110} height={40} /> : null}</div>
    </div>
  );
}

export default PrintComponent;
