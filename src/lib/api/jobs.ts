import type { Job } from '../types';
import { request } from './client';
export const jobsApi = { list: () => request<Job[]>('/jobs'), get: (id: string) => request<Job>(`/jobs/${id}`) };
