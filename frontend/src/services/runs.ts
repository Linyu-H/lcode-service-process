import { api } from './api'; import type { WorkflowRun } from '../types/run';
export const runsService = { list: () => api.get<WorkflowRun[]>('/api/v1/runs'), stop: (id:string) => api.post(`/api/v1/runs/${id}/stop`) };
