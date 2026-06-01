import { create } from 'zustand';
export const useWorkflowStore = create<{selectedNodeId?: string; setSelectedNodeId:(id?:string)=>void}>((set)=>({ setSelectedNodeId:(selectedNodeId)=>set({selectedNodeId}) }));
