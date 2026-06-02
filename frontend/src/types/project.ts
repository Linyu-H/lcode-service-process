export interface Project {
  id: string;
  name: string;
  description?: string;
  project_type: string;
  local_path: string;
  git_url?: string;
  default_workflow_id?: string;
  default_model_id?: string;
  status: string;
  last_run_status?: string;
  created_at?: string;
  updated_at?: string;
}
