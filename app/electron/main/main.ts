import { app, BrowserWindow } from 'electron';
import { initBackend } from '../../backend';
import { setupAuthIPC } from './ipc/authIPC';
import path from 'path';

// Segurança: Impedir múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow: BrowserWindow | null = null;

  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false, // Segurança obrigatória
        contextIsolation: true, // Segurança e LGPD 
        preload: path.join(__dirname, '../preload/preload.js'),
        sandbox: false // Necessário para Prisma local em alguns casos, mas monitorar
      },
    });

    // Em dev, carregaremos o localhost. Em prod, o arquivo index.html
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, '../../../dist/frontend/index.html'));
    }
  };

  app.whenReady().then(() => {
  // INICIALIZA O BACKEND AQUI
  initBackend();
  setupAuthIPC();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}