import { app, BrowserWindow } from 'electron';
import path from 'path';

// Importação dos Módulos do Backend e IPCs
import { initBackend } from '../../backend'; //
import { setupAuthIPC } from './ipc/authIPC'; //
import { setupSettingsIPC } from './ipc/settingsIPC'; // Fase 1.2

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Aponta para a pasta preload correta (subindo um nível de 'main' para 'electron' e descendo para 'preload')
      preload: path.join(__dirname, '../preload/preload.ts') 
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../../../dist/frontend/index.html')
    );
  }
}

app.whenReady().then(() => {
  // 1. INICIALIZA O BACKEND (Conexão com Banco, Logs)
  initBackend();

  // 2. REGISTRA OS EVENTOS IPC (Ouvintes)
  setupAuthIPC();     // Login/Cadastro
  setupSettingsIPC(); // Configurações

  // 3. CRIA A JANELA
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});