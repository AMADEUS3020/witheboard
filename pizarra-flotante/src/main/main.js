const { app, BrowserWindow, globalShortcut, screen } = require('electron');
const path = require('path');

// Atajos globales (cámbialos aquí si chocan con otro programa)
const SHORTCUTS = {
  toggle: 'CommandOrControl+Shift+D', // dibujo <-> pasar clics
  clear: 'CommandOrControl+Shift+X',  // limpiar todo
  quit: 'CommandOrControl+Shift+Q'    // cerrar la app
};

let win = null;
let drawing = true;

function setMode(isDrawing) {
  drawing = isDrawing;
  if (!win) return;
  if (drawing) {
    win.setIgnoreMouseEvents(false);
    win.focus();
  } else {
    // true + forward: los clics pasan al programa de abajo
    win.setIgnoreMouseEvents(true, { forward: true });
  }
  win.webContents.send('mode', drawing);
}

function createWindow() {
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds;

  win = new BrowserWindow({
    x, y, width, height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    movable: false,
    hasShadow: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Por encima de casi todo (incluye ventanas a pantalla completa en muchos casos)
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  win.once('ready-to-show', () => {
    win.show();
    setMode(true);
  });
}

app.whenReady().then(() => {
  createWindow();

  const reg = (accel, fn) => {
    if (!globalShortcut.register(accel, fn)) {
      console.warn(`No se pudo registrar el atajo ${accel} (ya está en uso)`);
    }
  };
  reg(SHORTCUTS.toggle, () => setMode(!drawing));
  reg(SHORTCUTS.clear, () => win && win.webContents.send('clear'));
  reg(SHORTCUTS.quit, () => app.quit());
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
