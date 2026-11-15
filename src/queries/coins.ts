import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCoinPerformance, apiCoinSettings, apiSaveCoinSettings, apiSetCoinsEnabled, type CoinSettingsPayload } from '../api';

const COIN_KEY = ['coin'] as const;

export function useCoinSettingsQuery() {
  return useQuery({ queryKey: [...COIN_KEY, 'settings'], queryFn: apiCoinSettings });
}

export function useCoinPerformance(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: [...COIN_KEY, 'performance', from, to],
    queryFn: () => apiCoinPerformance(from, to),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSaveCoinSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CoinSettingsPayload) => apiSaveCoinSettings(payload),
    onSuccess: (saved) => client.setQueryData([...COIN_KEY, 'settings'], saved),
  });
}

export function useCoinsEnabled() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (active: boolean) => apiSetCoinsEnabled(active),
    onSuccess: (saved) => client.setQueryData([...COIN_KEY, 'settings'], saved),
  });
}
