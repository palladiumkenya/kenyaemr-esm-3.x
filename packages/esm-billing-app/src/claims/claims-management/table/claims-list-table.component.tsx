import React from 'react';
import ClaimsTable from './claim-table.component';

const ClaimsManagementTable: React.FC = () => {
  return (
    <ClaimsTable
      title="claims"
      emptyStateText="emptyClaimsState"
      emptyStateHeader="Claims"
      includeClaimCode={true}
      use="claim"
    />
  );
};

export default ClaimsManagementTable;
