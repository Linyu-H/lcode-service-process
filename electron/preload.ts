import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('lcode', {
  appVersion: () => ipcRenderer.invoke('app:version'),
  openDirectory: (path: string) => ipcRenderer.invoke('shell:openDirectory', path),
  selectDirectory: () => ipcRenderer.invoke('shell:selectDirectory'),
  backendStatus: () => ipcRenderer.invoke('backend:status')
});
