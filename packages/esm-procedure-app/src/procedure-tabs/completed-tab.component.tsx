import React from 'react';
import { CompletedList } from '../completed-list/completed-list.component';

const CompletedComponent = () => {
  return (
    <div>
      <CompletedList fulfillerStatus={'COMPLETED'} />
    </div>
  );
};

export default CompletedComponent;
