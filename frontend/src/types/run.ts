export interface WorkflowRun { id: string; workflow_id: string; project_id?: string; status: string; current_node_key?: string; progress: number; error_message?: string; }
