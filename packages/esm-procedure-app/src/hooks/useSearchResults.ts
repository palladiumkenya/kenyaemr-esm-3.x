import { formatDate, parseDate } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { Result } from '../work-list/work-list.resource';

export function useSearchResults(data: Result[], searchString: string) {
  const flattenedData = data.map((eachObject) => {
    return {
      ...eachObject,
      id: eachObject.uuid,
      date: formatDate(parseDate(eachObject.dateActivated)),
      patient: eachObject.patient.display.split('-')[1],
      orderNumber: eachObject.orderNumber,
      accessionNumber: eachObject.accessionNumber,
      procedure: eachObject.concept.display,
      action: eachObject.action,
      status: eachObject.fulfillerStatus ?? '--',
      orderer: eachObject.orderer.display,
      urgency: eachObject.urgency,
    };
  });

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return flattenedData.filter((eachDataRow) =>
        Object.entries(eachDataRow).some(([header, value]) => {
          if (header === 'patientUuid') {
            return false;
          }
          return `${value}`.toLowerCase().includes(search);
        }),
      );
    }

    return flattenedData;
  }, [searchString, data]);

  return searchResults;
}
