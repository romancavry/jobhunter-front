export type PageId = 'dashboard' | 'jobs' | 'applications' | 'sources' | 'settings';
export interface Job { id: string; source: string; external_id: string; title: string; company: string; location: string | null; url: string; description: string | null; match_score: number | null; created_at: string; }
export type SourceType = 'XING' | 'INDEED';
export interface SourceSettings { keywords?: string[]; location?: string; maxPages?: number; [key: string]: unknown; }
export interface JobSource { id: string; name: string; type: SourceType; url: string; enabled: boolean; settings: SourceSettings; created_at: string; updated_at: string; }
export interface SourceInput { name: string; type: SourceType; url: string; enabled: boolean; settings: SourceSettings; }
export interface SyncResult { sourceId: string; fetched: number; saved: number; }
export type ToastKind = 'success' | 'error' | 'info';
export interface ToastMessage { id: number; kind: ToastKind; title: string; message?: string; }
