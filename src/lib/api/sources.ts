import type { JobSource, SourceInput, SyncResult } from '../types';
import { request } from './client';
export const sourcesApi = {
  list: () => request<JobSource[]>('/sources'),
  get: (id: string) => request<JobSource>(`/sources/${id}`),
  create: (data: SourceInput) => request<JobSource>('/sources', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<SourceInput>) => request<JobSource>(`/sources/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id: string) => request<{ success: boolean }>(`/sources/${id}`, { method: 'DELETE' }),
  sync: (id: string) => request<SyncResult>(`/sources/${id}/sync`, { method: 'POST' })
};
