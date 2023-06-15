import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useEnrollmentHistory = (patientUuid: string) => {
  const enrollmentHistoryUrl = `/ws/rest/v1/kenyaemr/patientHistoricalEnrollment?patientUuid=${patientUuid}`;
  const { data, mutate, error, isLoading } = useSWR<{ data: Array<any> }>(enrollmentHistoryUrl, openmrsFetch);

  const groupedEnrollment = groupDataByProgram(data?.data ?? []);

  return {
    data: groupedEnrollment ?? [],
    isError: error,
    isLoading: isLoading,
  };
};

function groupDataByProgram(data) {
  const groupedData = [];

  data.forEach((item) => {
    const programName = item.programName;
    const status = item.active ? 'Active' : 'Inactive';

    const existingGroup = groupedData.find((group) => group.programName === programName && group.status === status);

    if (existingGroup) {
      existingGroup.data.push(item);
    } else {
      groupedData.push({ programName, status, data: [item] });
    }
  });

  return groupedData;
}
