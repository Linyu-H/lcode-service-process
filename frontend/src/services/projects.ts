import { api } from './api'; import type { Project } from '../types/project';
export const projectService = { list: () => api.get<Project[]>('/api/v1/projects'), create: (p: Partial<Project>) => api.post<Project>('/api/v1/projects', p), remove: (id: string) => api.del(`/api/v1/projects/${id}`) };
