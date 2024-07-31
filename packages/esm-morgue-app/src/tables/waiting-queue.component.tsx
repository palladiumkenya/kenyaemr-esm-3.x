import React from 'react';
import GenericTable from './generic-table.component';
export const WaitingQueue: React.FC = () => {
  return (
    <GenericTable
      data={[]}
      headers={[]}
      renderRow={function (item: any): React.ReactNode {
        throw new Error('Function not implemented.');
      }}
    />
  );
};
