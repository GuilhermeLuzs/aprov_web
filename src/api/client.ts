const API_PATH = '/api';
const CSRF_PATH = '/sanctum/csrf-cookie';
const CSRF_COOKIE = 'XSRF-TOKEN';
const UNAUTHORIZED = 401;
const SESSION_EXPIRED = 419;

export class ApiError extends Error {
  errors: Record<string, string[]>;
  status: number;

  constructor(message: string, errors: Record<string, string[]> = {}, status = 0) {
    super(message);
    this.errors = errors;
    this.status = status;
  }
}

export class NetworkError extends ApiError {}

type ApiEnvelope<T> = { success: boolean; message: string; data?: T; errors?: Record<string, string[]> };

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = { method?: Method; body?: unknown };

let unauthorizedHandler: (() => void) | null = null;

export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}

function csrfToken(): string | null {
  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith(`${CSRF_COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(CSRF_COOKIE.length + 1)) : null;
}

async function refreshCsrfToken(): Promise<void> {
  await fetch(CSRF_PATH, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
}

async function send(path: string, method: Method, body: unknown): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') {
    if (!csrfToken()) await refreshCsrfToken();
    const token = csrfToken();
    if (token) headers['X-XSRF-TOKEN'] = token;
  }
  return fetch(`${API_PATH}/${path}`, {
    method,
    headers,
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  let response: Response;
  try {
    response = await send(path, method, body);
    if (response.status === SESSION_EXPIRED && method !== 'GET') {
      await refreshCsrfToken();
      response = await send(path, method, body);
    }
  } catch {
    throw new NetworkError('Não deu para conectar com a APROV. Confira a internet e tente de novo.');
  }

  if (response.status === UNAUTHORIZED) unauthorizedHandler?.();

  const envelope = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !envelope || !envelope.success) {
    throw new ApiError(envelope?.message ?? 'Algo deu errado. Tente de novo.', envelope?.errors ?? {}, response.status);
  }

  return envelope.data as T;
}
