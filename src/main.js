const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const traverseAndAppendFiles = require("./traverseAndAppendFiles.js");
const path = require("path");
const fs = require("fs").promises;

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
  mainWindow.webContents.openDevTools();
});

ipcMain.on("open-directory-dialog", async (event) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });

    if (!result.canceled) {
      const selectedDirectory = result.filePaths[0];

      // Get the file structure
      event.sender.send("loading-start");
      const fileStructure = await getFilesFromDirectory(selectedDirectory);
      event.sender.send("loading-end");

      // Send the selected directory and the file structure to the renderer
      event.sender.send("selected-directory", {
        directory: selectedDirectory,
        structure: fileStructure
      });
    }
  } catch (err) {
    console.log(err);
  }
});


ipcMain.on("start-traverse", (event, config) => {
  const {
    sourceDirectoryInput,
    outputPath,
    ignoreList,
    fullPath,
  } = config;
  traverseAndAppendFiles(
    sourceDirectoryInput,
    outputPath,
    ignoreList,
    fullPath,
    event // Pass the sendMessage function to traverseAndAppendFiles
  );
});

ipcMain.on("traverse-messages", (event, message) => {
  // Send the message to the renderer process using mainWindow.webContents.send
  mainWindow.webContents.send("traverse-messages", message);
});

async function getFilesFromDirectory(selectedDirectory) {
  let structure = {
      files: [],
      folders: {},
  };

  // Read all items in the current directory
  const items = await fs.readdir(selectedDirectory);
  const itemPromises = items.map(async item => {
      const itemPath = path.join(selectedDirectory, item);
      const stat = await fs.stat(itemPath);

      // Check if the item is a file
      if (stat.isFile()) {
          structure.files.push(item);
      }
      // Check if the item is a directory
      else if (stat.isDirectory()) {
          structure.folders[item] = await getFilesFromDirectory(itemPath);
      }
  });

  await Promise.all(itemPromises);

  return structure;
}

