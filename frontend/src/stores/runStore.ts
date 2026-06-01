import { create } from 'zustand';
export const useRunStore = create<{events:any[]; push:(event:any)=>void; clear:()=>void}>((set)=>({ events: [], push:(event)=>set((s)=>({events:[event,...s.events].slice(0,200)})), clear:()=>set({events:[]}) }));
