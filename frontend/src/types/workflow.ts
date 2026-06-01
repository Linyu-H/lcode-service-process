export interface Workflow { id: string; project_id?: string; name: string; description?: string; version: number; graph_json: string; status: string; is_template: boolean; }
export interface NodeTemplate { id: string; node_type: string; name: string; category: string; description?: string; executable: boolean; }
