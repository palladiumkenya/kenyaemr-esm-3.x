import React from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { EmptyState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';

import OrderTable from '../../shared/orders/OrderTable';

import { type Order } from '../../types/order/order';
import { type ExpressWorkflowConfig } from '../../config-schema';
import styles from './procedures.scss';

type ProceduresTableProps = {
  orders: Order[];
};
const ProceduresTable: React.FC<ProceduresTableProps> = ({ orders }) => {
  const { t } = useTranslation();
  const { imagingOrderTypeUuid, imagingOrderableConceptSets } = useConfig<ExpressWorkflowConfig>();

  const launchAddLabOrder = useLaunchWorkspaceRequiringVisit('add-procedures-order');

  if (orders?.length === 0) {
    return (
      <Layer>
        <EmptyState
          displayText={t('anOrder', 'an order')}
          headerTitle={t('proceduresOrders', 'Procedures Orders')}
          launchForm={() =>
            launchAddLabOrder({
              orderTypeUuid: imagingOrderTypeUuid,
              orderableConceptSets: imagingOrderableConceptSets,
            })
          }
        />
      </Layer>
    );
  }

  return (
    <OrderTable
      title={t('proceduresOrders', 'Procedures Orders')}
      orders={orders}
      onAdd={() =>
        launchAddLabOrder({
          orderTypeUuid: imagingOrderTypeUuid,
          orderableConceptSets: imagingOrderableConceptSets,
        })
      }
      containerClassName={styles.labTableContainer}
      tableCellClassName={styles.tableCell}
      priorityPillClassName={styles.priorityPill}
      statusPillClassName={styles.statusPill}
    />
  );
};

export default ProceduresTable;
