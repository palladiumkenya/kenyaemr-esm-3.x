import React from 'react';
import NotDoneList from '../not-done-list/not-done-list.component';

const NotDoneComponent = () => {
  return (
    <div>
      <NotDoneList fulfillerStatus={'DECLINED'} />
    </div>
  );
};

export default NotDoneComponent;
