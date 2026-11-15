import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiPanelOverview } from '../api';

export function useCompanyOverview(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['overview', from, to],
    queryFn: () => apiPanelOverview(from, to),
    enabled,
    placeholderData: keepPreviousData,
  });
}
