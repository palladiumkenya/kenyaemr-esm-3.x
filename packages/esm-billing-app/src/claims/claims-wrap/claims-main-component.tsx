import React from 'react';
import styles from './claims-main.scss';
import { MappedBill } from '../../types';
import ClaimsTable from '../claims-dashboard/claims-table.component.tsx/claims-table.component';
import ClaimsForm from '../claims-dashboard/claims-form/claims-form.component';

interface ClaimsMainHeaderProps {
  bill: MappedBill;
}

const ClaimMainComponent: React.FC<ClaimsMainHeaderProps> = ({ bill }) => {
  return (
    <div className={styles.mainContainer}>
      <ClaimsTable bill={bill} isLoadingBill={false} onSelectItem={() => {}} />
      <ClaimsForm />
    </div>
  );
};

export default ClaimMainComponent;
