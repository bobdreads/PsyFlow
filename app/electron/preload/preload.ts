import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  auth: {
    login: (data: any) => ipcRenderer.invoke('auth:login', data),
    register: (data: any) => ipcRenderer.invoke('auth:register', data),
  },
  // Exemplo de canal seguro de comunicação
  send: (channel: string, data: any) => {
    // Whitelist de canais permitidos (implementaremos depois)
    ipcRenderer.send(channel, data);
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  settings: {
    get: (userId: string) => ipcRenderer.invoke('settings:get', userId),
    update: (userId: string, data: any) => ipcRenderer.invoke('settings:update', { userId, data }),
  },
  patients: {
    create: (data: any) => ipcRenderer.invoke('patients:create', data),
    list: (userId: string) => ipcRenderer.invoke('patients:list', userId),
    delete: (id: string, userId: string) => ipcRenderer.invoke('patients:delete', { id, userId }),
    update: (id: string, userId: string, data: any) => ipcRenderer.invoke('patients:update', { id, userId, data }),
  },
});