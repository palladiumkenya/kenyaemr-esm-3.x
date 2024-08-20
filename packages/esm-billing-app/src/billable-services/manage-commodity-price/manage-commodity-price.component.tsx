import React from 'react';
import StockItemsTableComponent from './stock-items-table.component';
import { WorkspaceContainer } from '@openmrs/esm-framework';

const ManageCommodityPrices = () => {
  return (
    <div>
      <StockItemsTableComponent />
      <WorkspaceContainer overlay contextKey="manage-commodity-prices" />
    </div>
  );
};
export default ManageCommodityPrices;
