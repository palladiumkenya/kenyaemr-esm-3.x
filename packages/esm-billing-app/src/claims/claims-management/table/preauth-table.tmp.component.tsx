import React from 'react';
import ClaimsTable from './claim-table.component';

const PreauthTableTemporary: React.FC = () => {
  return (
    <ClaimsTable
      title="preauthsRequests"
      emptyStateText="emptyPreauthState"
      emptyStateHeader="emptyPreauthHeader"
      includeClaimCode={false}
      use="preauthorization"
    />
  );
};

export default PreauthTableTemporary;
