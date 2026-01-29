import { app, BrowserWindow } from 'electron';
import path from 'path';

// 1. Importação dos Módulos do Backend e IPCs
import { initBackend } from '../../backend'; // Inicializa banco e logs
import { setupAuthIPC } from './ipc/authIPC'; // Sistema de Login/Cadastro
import { setupSettingsIPC } from './ipc/settingsIPC'; // Sistema de Configurações
import { setupPatientIPC } from './ipc/patientIPC'; // Sistema de Pacientes

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Segurança
      contextIsolation: true, // Segurança (Exige preload correto)
      // CORREÇÃO CRÍTICA AQUI:
      // Sobe um nível (../) e entra na pasta preload para achar o arquivo compilado
      preload: path.join(__dirname, '../preload/preload.js') 
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
  // 2. INICIALIZA O BACKEND
  initBackend();

  // 3. REGISTRA OS EVENTOS (IPCs)
  setupAuthIPC();     // Habilita login e registro
  setupSettingsIPC(); // Habilita salvar/ler configurações
  setupPatientIPC();  // Habilita gerenciamento de pacientes

  // 4. CRIA A JANELA
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});