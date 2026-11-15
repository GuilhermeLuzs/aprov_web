import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api';

const NOT_RETRIED = [401, 403, 404, 422];
const MAX_RETRIES = 2;
const STALE_MS = 30_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      refetchOnWindowFocus: false,
      retry: (failures, error) =>
        failures < MAX_RETRIES && !(error instanceof ApiError && NOT_RETRIED.includes(error.status)),
    },
  },
});
