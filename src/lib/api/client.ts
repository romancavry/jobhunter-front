const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const DEFAULT_API_BASE_URL = envBaseUrl || '/api';

export function getApiBaseUrl() {
  if (typeof localStorage === 'undefined') return DEFAULT_API_BASE_URL;
  return localStorage.getItem('jobhunter-api-url')?.trim() || DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(value: string) {
  if (typeof localStorage === 'undefined') return;
  const normalized = value.trim().replace(/\/$/, '');
  if (!normalized || normalized === DEFAULT_API_BASE_URL) localStorage.removeItem('jobhunter-api-url');
  else localStorage.setItem('jobhunter-api-url', normalized);
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}

function apiUrl(path: string) { return `${getApiBaseUrl().replace(/\/$/, '')}/${path.replace(/^\//, '')}`; }

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), { ...init, headers: { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers } });
  } catch { throw new ApiError('Could not reach the JobHunter API. Is the backend running?', 0); }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json() as { message?: string | string[] }; message = Array.isArray(body.message) ? body.message.join('. ') : body.message || message; } catch { /* use fallback */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return text ? JSON.parse(text) as T : undefined as T;
}
