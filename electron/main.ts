import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import http from 'http';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcessWithoutNullStreams | null = null;
const isDev = !app.isPackaged;
const backendUrl = 'http://127.0.0.1:8765/health';

function waitForBackend(timeoutMs = 20000): Promise<boolean> {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      http.get(backendUrl, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) resolve(false);
        else setTimeout(tick, 500);
      });
    };
    tick();
  });
}

function startBackend() {
  if (backendProcess) return;
  const backendCwd = path.join(app.getAppPath(), 'backend');
  backendProcess = spawn('python3.11', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8765'], {
    cwd: backendCwd,
    env: { ...process.env, LCODE_DATA_DIR: path.join(app.getPath('userData'), 'lcode-service-process') }
  });
  backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`[backend] ${data}`));
  backendProcess.on('exit', () => { backendProcess = null; });
}

async function createWindow() {
  if (!isDev) startBackend();
  await waitForBackend(isDev ? 1000 : 20000);
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1100,
    minHeight: 760,
    title: 'Lcode Service Process',
    backgroundColor: '#0F172A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  if (isDev) await mainWindow.loadURL('http://127.0.0.1:5173');
  else await mainWindow.loadFile(path.join(app.getAppPath(), 'frontend/dist/index.html'));
}

ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('backend:status', () => Boolean(backendProcess));
ipcMain.handle('shell:openDirectory', async (_event, dir: string) => shell.openPath(dir));

app.whenReady().then(createWindow);
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (backendProcess) backendProcess.kill(); });
