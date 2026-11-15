import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  apiCreateItem,
  apiItemMetrics,
  apiPanelItem,
  apiPanelItems,
  apiSetItemStatus,
  apiUpdateItem,
  type CatalogQuery,
  type ItemPayload,
} from '../api';

const CATALOG_KEY = ['catalog'] as const;

export function useCatalogPage(query: CatalogQuery) {
  return useQuery({
    queryKey: [...CATALOG_KEY, 'page', query],
    queryFn: () => apiPanelItems(query),
    placeholderData: keepPreviousData,
  });
}

export function useCatalogItem(id: number | null) {
  return useQuery({
    queryKey: [...CATALOG_KEY, 'item', id],
    queryFn: () => apiPanelItem(id as number),
    enabled: id !== null,
    staleTime: 0,
  });
}

export function useItemMetrics(id: number, from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: [...CATALOG_KEY, 'metrics', id, from, to],
    queryFn: () => apiItemMetrics(id, from, to),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSaveItem(id: number | null) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: ItemPayload) => (id === null ? apiCreateItem(payload) : apiUpdateItem(id, payload)),
    onSuccess: () => client.invalidateQueries({ queryKey: CATALOG_KEY }),
  });
}

export function useItemStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => apiSetItemStatus(id, active),
    onSuccess: () => client.invalidateQueries({ queryKey: CATALOG_KEY }),
  });
}
