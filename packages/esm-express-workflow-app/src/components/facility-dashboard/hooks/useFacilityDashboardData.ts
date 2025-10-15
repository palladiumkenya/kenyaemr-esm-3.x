import useSWR from 'swr';
import { fetchDashboardData, DashboardData } from '../facility-dashboard.resource';

export function useFacilityDashboardData(startDate?: string, endDate?: string) {
  const { data, error, isLoading } = useSWR<DashboardData>(
    startDate && endDate ? ['dashboard-data', startDate, endDate] : null,
    () => fetchDashboardData(startDate, endDate),
  );

  return {
    data,
    error,
    isLoading,
  };
}
