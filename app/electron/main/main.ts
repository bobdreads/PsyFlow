import electron from 'electron';
import type { BrowserWindow as BrowserWindowType } from 'electron';
import { initBackend } from '../../backend';
import { setupAuthIPC } from './ipc/authIPC';
import path from 'path';

const { app, BrowserWindow, ipcMain } = electron;

let mainWindow: BrowserWindowType | null = null;

// ✅ CORRIGIDO: Single instance DEPOIS do app.whenReady()
app.whenReady().then(async () => {
  // Single instance lock (LINHA 7 OK agora)
  const gotTheLock = app.requestSingleInstanceLock();
  
  if (!gotTheLock) {
    app.quit();
    return;
  }

  // Segunda instância foca a primeira
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // INICIALIZA BACKEND + IPC PRIMEIRO
  await initBackend();
  setupAuthIPC();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/preload.js'),
      sandbox: false
    },
    show: false  // Esconde até carregar
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (process.env.NODE_ENV === 'development') {
      mainWindow?.webContents.openDevTools();
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../../dist/frontend/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
