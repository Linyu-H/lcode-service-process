import { api } from './api';
import type { Project } from '../types/project';

export const projectService = {
  list: () => api.get<Project[]>('/api/v1/projects'),
  create: (p: Partial<Project>) => api.post<Project>('/api/v1/projects', p),
  update: (id: string, p: Partial<Project>) => api.put<Project>(`/api/v1/projects/${id}`, p),
  remove: (id: string) => api.del(`/api/v1/projects/${id}`),
  openDirectory: (id: string) => api.post<{ path: string; message: string }>(`/api/v1/projects/${id}/open-directory`)
};
