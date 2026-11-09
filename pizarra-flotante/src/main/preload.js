const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onMode: (cb) => ipcRenderer.on('mode', (_e, drawing) => cb(drawing)),
  onClear: (cb) => ipcRenderer.on('clear', () => cb())
});
