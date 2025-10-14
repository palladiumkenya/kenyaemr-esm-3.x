import React from 'react';
import { parseDate, formatDatetime, useConfig } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import { Add } from '@carbon/react/icons';
import { Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import OrderTable from '../../shared/orders/OrderTable';

import { type Order } from '../../types/order/order';
import { type ExpressWorkflowConfig } from '../../config-schema';
import styles from './radiology-and-imaging.scss';

type RadiologyAndImagingTableProps = {
  orders: Order[];
};
const RadiologyAndImagingTable: React.FC<RadiologyAndImagingTableProps> = ({ orders }) => {
  const { t } = useTranslation();
  const { imagingOrderTypeUuid, imagingOrderableConceptSets } = useConfig<ExpressWorkflowConfig>();

  const launchAddLabOrder = useLaunchWorkspaceRequiringVisit('add-imaging-order');

  if (orders?.length === 0) {
    return (
      <Layer>
        <EmptyState
          displayText={t('anOrder', 'an order')}
          headerTitle={t('radiologyAndImagingOrders', 'Radiology and Imaging Orders')}
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
      title={t('radiologyAndImagingOrders', 'Radiology & Imaging Orders')}
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

export default RadiologyAndImagingTable;
