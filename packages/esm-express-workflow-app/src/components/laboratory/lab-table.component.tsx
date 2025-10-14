import React from 'react';
import { Order } from '../../types/order/order';
import { Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import styles from './laboratory-tabs.scss';
import { EmptyState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { ExpressWorkflowConfig } from '../../config-schema';
import OrderTable from '../../shared/orders/OrderTable';

type LabTableProps = {
  orders: Order[];
};
const LabTable: React.FC<LabTableProps> = ({ orders }) => {
  const { t } = useTranslation();
  const { labOrderTypeUuid, orderableConceptSets } = useConfig<ExpressWorkflowConfig>();

  const launchAddLabOrder = useLaunchWorkspaceRequiringVisit('add-lab-order');

  if (orders?.length === 0) {
    return (
      <Layer>
        <EmptyState
          displayText={t('anOrders', 'an orders')}
          headerTitle={t('laboratoryOrders', 'Laboratory Orders')}
          launchForm={() => launchAddLabOrder({ orderTypeUuid: labOrderTypeUuid, orderableConceptSets })}
        />
      </Layer>
    );
  }

  return (
    <OrderTable
      title={t('laboratoryOrders', 'Laboratory Orders')}
      orders={orders}
      onAdd={() => launchAddLabOrder({ orderTypeUuid: labOrderTypeUuid, orderableConceptSets })}
      containerClassName={styles.labTableContainer}
      tableCellClassName={styles.tableCell}
      priorityPillClassName={styles.priorityPill}
      statusPillClassName={styles.statusPill}
    />
  );
};

export default LabTable;
