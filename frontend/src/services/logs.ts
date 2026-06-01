import { api } from './api';
export const logsService = { operations: () => api.get<any[]>('/api/v1/logs/operations'), commands: () => api.get<any[]>('/api/v1/logs/commands'), files: () => api.get<any[]>('/api/v1/logs/file-changes'), ai: () => api.get<any[]>('/api/v1/logs/ai-requests') };
