import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('lcode', {
  appVersion: () => ipcRenderer.invoke('app:version'),
  openDirectory: (path: string) => ipcRenderer.invoke('shell:openDirectory', path),
  backendStatus: () => ipcRenderer.invoke('backend:status')
});
