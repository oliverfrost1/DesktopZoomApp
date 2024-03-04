import {
  app,
  BrowserWindow,
  globalShortcut,
  desktopCapturer,
  ipcMain,
  screen,
} from "electron";
import path from "path";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let window: BrowserWindow | null;
const createWindow = () => {
  // Create the browser window.
  window = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    transparent: false,
    alwaysOnTop: true,
    frame: true,
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  window.webContents.openDevTools();
};

const registerShortcuts = () => {
  globalShortcut.register("Ctrl+Shift+Z", () => {
    console.log("You pressed Ctrl+Shift+Z");
    window.webContents.setZoomFactor(2); // Zoom in 200%
  });
};

ipcMain.on("request-window-position", (event) => {
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
  const { x, y, width, height } = window.getBounds();

  // Adjusting for the display's scaling factor
  const adjustedX = x * scaleFactor;
  const adjustedY = y * scaleFactor;
  const adjustedWidth = width * scaleFactor;
  const adjustedHeight = height * scaleFactor;

  event.reply("window-position", {
    x: adjustedX,
    y: adjustedY,
    width: adjustedWidth,
    height: adjustedHeight,
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

app.on("ready", registerShortcuts);

app.on("ready", () => {
  desktopCapturer.getSources({ types: ["screen"] }).then(async (sources) => {
    for (const source of sources) {
      window.webContents.send("SET_SOURCE", source.id);
      return;
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
