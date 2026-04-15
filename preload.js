const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  resizeWindow: (width, height, fullscreen) => ipcRenderer.send('resize-window', width, height, fullscreen)
});
