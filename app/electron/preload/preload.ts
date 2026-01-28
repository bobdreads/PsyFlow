import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Exemplo de canal seguro de comunicação
  send: (channel: string, data: any) => {
    // Whitelist de canais permitidos (implementaremos depois)
    ipcRenderer.send(channel, data);
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});