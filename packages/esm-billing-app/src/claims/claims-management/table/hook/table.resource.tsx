import { useMemo } from 'react';
import { mapShaData, shaMap } from '../table-mock-up-data';

const useShaData = () => {
  const data = useMemo(() => mapShaData(shaMap) || [], []);
  return data;
};

export default useShaData;
