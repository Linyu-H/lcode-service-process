import { create } from 'zustand';
interface AppState { theme: 'dark' | 'light'; apiOnline: boolean; bottomLogOpen: boolean; setTheme: (t:'dark'|'light')=>void; setApiOnline:(v:boolean)=>void; toggleLog:()=>void; }
export const useAppStore = create<AppState>((set) => ({ theme: 'dark', apiOnline: false, bottomLogOpen: true, setTheme: (theme) => set({theme}), setApiOnline: (apiOnline) => set({apiOnline}), toggleLog: () => set((s)=>({bottomLogOpen: !s.bottomLogOpen})) }));
