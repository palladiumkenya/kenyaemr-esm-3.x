import { useState, useEffect } from 'react';

interface RegimenItem {
  name: string;
  conceptRef: string;
}

interface RegimenLineGroup {
  regimenline: string;
  regimenLineValue: string;
  regimen: RegimenItem[];
}

function useFilteredRegimen(regimenData: RegimenLineGroup[] | undefined, patientAge: number): RegimenLineGroup[] {
  const [filteredRegimen, setFilteredRegimen] = useState<RegimenLineGroup[]>([]);

  useEffect(() => {
    if (regimenData) {
      const filterCriterion = patientAge > 14 ? 'Adult' : 'Child';
      const filtered = regimenData.filter((group) => group.regimenline.startsWith(filterCriterion));
      setFilteredRegimen(filtered);
    }
  }, [regimenData, patientAge]);

  return filteredRegimen;
}

export default useFilteredRegimen;
