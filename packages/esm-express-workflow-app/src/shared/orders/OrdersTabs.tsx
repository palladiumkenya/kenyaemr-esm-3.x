import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { Layer, Tabs, TabList, Tab, TabPanels, TabPanel, TabsSkeleton } from '@carbon/react';
import { DocumentMultiple_02, RequestQuote } from '@carbon/react/icons';
import { usePatientOrders } from '../../hooks/useOrders';
import { type Order } from '../../types/order/order';

type OrdersTabsProps = {
  patientUuid: string;
  patient: fhir.Patient;
  basePath: string;
  resultsSlotName: string;
  orderTypeUuid: string;
  filter?: (o: Order) => boolean;
  Table: React.ComponentType<{ orders: Order[] }>;
};

export const OrdersTabs: React.FC<OrdersTabsProps> = ({
  patientUuid,
  patient,
  basePath,
  resultsSlotName,
  orderTypeUuid,
  filter,
  Table,
}) => {
  const { t } = useTranslation();
  const state = useMemo(() => ({ patientUuid, patient, basePath }), [patientUuid, patient, basePath]);
  const { data: orders, isLoading, error } = usePatientOrders(patientUuid, 'any', orderTypeUuid, undefined, undefined);

  const filteredOrders = useMemo(() => (filter ? orders?.filter(filter) ?? [] : orders ?? []), [filter, orders]);

  if (isLoading) {
    return <TabsSkeleton contained />;
  }

  return (
    <Layer>
      <Tabs>
        <TabList contained>
          <Tab renderIcon={RequestQuote}>{t('orders', 'Orders')}</Tab>
          <Tab renderIcon={DocumentMultiple_02}>{t('results', 'Results')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Table orders={filteredOrders} />
          </TabPanel>
          <TabPanel>
            <ExtensionSlot state={state} name={resultsSlotName} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Layer>
  );
};

export default OrdersTabs;
