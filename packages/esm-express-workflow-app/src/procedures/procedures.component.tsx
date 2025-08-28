import { ExtensionSlot, useDefineAppContext } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import dayjs from 'dayjs';

export type DateFilterContext = {
  dateRange: Array<Date>;
  setDateRange: React.Dispatch<React.SetStateAction<Array<Date>>>;
};
const Procedures: React.FC = () => {
  const [dateRange, setDateRange] = useState<Date[]>([dayjs().startOf('day').toDate(), new Date()]);
  useDefineAppContext<DateFilterContext>('procedures-date-filter', { dateRange, setDateRange });

  return (
    <div>
      <ExtensionSlot name="procedures-dashboard-slot" />
    </div>
  );
};

export default Procedures;
