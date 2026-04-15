const { app, BrowserWindow, ipcMain } = require('electron'); 
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen:true,
    title: "Pixel Dungeon PC",
    icon: path.join(__dirname, 'public', 'icon.ico'),    
    webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    nodeIntegration: false,
    contextIsolation: true 
    },
    autoHideMenuBar: true,
  });

if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

// --- PENCERE BOYUTLANDIRMA EMRİNİ DİNLE ---
ipcMain.on('resize-window', (event, width, height, fullscreen) => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) return;

  if (fullscreen) {
    win.setFullScreen(true);
  } else {
    win.setFullScreen(false);
    win.setSize(width, height);
    win.center(); // Pencereyi ekranın ortasına al
  }
});
// -------------------------------------------

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});