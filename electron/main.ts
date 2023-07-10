import { app, BrowserWindow, dialog } from "electron";
import path from "node:path";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
import { autoUpdater } from "electron-updater";

// autoUpdater.forceDevUpdateConfig = true;

// autoUpdater.disableWebInstaller = true;
const repo = "Shaukat456/ElectronAPP2";

// const token = "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";
const token = "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";

autoUpdater.setFeedURL({
  provider: "github",
  repo: "ElectronAPP2",
  owner: "Shaukat456",
  token,
  releaseType: "release",
});

// Configure auto-updater
autoUpdater.autoDownload = false; // Disable automatic downloading of updates

// Listen for update events
autoUpdater.on("checking-for-update", () => {
  console.log("Checking for updates...");
});

autoUpdater.on("update-available", (info) => {
  console.log("Update available:", info);
  // Prompt the user to start the download
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Available",
      message:
        "A new version of the application is available. Do you want to download it?",
      buttons: ["Download", "Cancel"],
      defaultId: 0,
    })
    .then((response) => {
      if (response.response === 0) {
        // User chose to download the update
        autoUpdater.downloadUpdate();
      }
    });
});

autoUpdater.on("update-not-available", () => {
  console.log("No updates available.");
});

autoUpdater.on("error", (err) => {
  console.error("Update error:", err);
});

autoUpdater.on("download-progress", (progress) => {
  console.log(`Download progress: ${Math.floor(progress.percent)}%`);
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update downloaded:", info);
  // Prompt the user to install the update
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Downloaded",
      message:
        "The update has been downloaded. Restart the application to apply the update.",
      buttons: ["Restart", "Later"],
      defaultId: 0,
    })
    .then((response) => {
      if (response.response === 0) {
        // User chose to restart the application
        autoUpdater.quitAndInstall();
      }
    });
});

process.env.DIST = path.join(__dirname, "../dist");
process.env.PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  win = null;
});

app.whenReady().then(createWindow);
