const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const SettingsManager = require('./lib/settings');
const DatabaseManager = require('./lib/database');
const APIManager = require('./lib/api');

// Initialize managers
let settingsManager;
let databaseManager;
let apiManager;
let mainWindow;

function createWindow() {
  // Load saved window size or use defaults
  const windowSize = settingsManager.get('windowSize');
  
  const win = new BrowserWindow({
    width: windowSize.width,
    height: windowSize.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js') // We'll create this
    },
    icon: path.join(__dirname, 'assets/icon.ico'),
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: false
  });

  // Save window reference
  mainWindow = win;

  win.loadFile('dist/index.html');
  
  // Show window when ready to prevent visual flash
  win.once('ready-to-show', () => {
    win.show();
    win.focus();
    
    // Update last opened time
    settingsManager.set('lastOpened', new Date().toISOString());
  });

  // Save window size when it changes
  win.on('resize', () => {
    const [width, height] = win.getSize();
    settingsManager.set('windowSize', { width, height });
  });

  // Handle external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  return win;
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'About ForTheWeebs',
          click: () => {
            const stats = databaseManager.getStats();
            const settings = settingsManager.getAll();
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About ForTheWeebs',
              message: 'ForTheWeebs v1.0.0',
              detail: `A modern desktop application for anime enthusiasts.

📊 Your Stats:
• Anime Watched: ${stats.totalWatched}
• Total Episodes: ${stats.totalEpisodes}
• Hours Watched: ${stats.totalHours}h
• Average Rating: ${stats.averageRating}/10

🎨 Theme: ${settings.theme}
📍 Last Opened: ${new Date(settings.lastOpened).toLocaleDateString()}

Built with Electron and Vite.`

            });
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            // Open settings window - we'll implement this
            createSettingsWindow();
          }
        },
        {
          label: 'Export Data',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Export Anime Data',
              defaultPath: 'fortheweebs-export.json',
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              const fs = require('fs');
              try {
                fs.writeFileSync(result.filePath, databaseManager.exportData());
                dialog.showMessageBox(mainWindow, {
                  type: 'info',
                  title: 'Export Successful',
                  message: 'Your anime data has been exported successfully!'
                });
              } catch (error) {
                dialog.showErrorBox('Export Failed', 'Failed to export data: ' + error.message);
              }
            }
          }
        },
        {
          label: 'Import Data',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Import Anime Data',
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              const fs = require('fs');
              try {
                const data = fs.readFileSync(result.filePaths[0], 'utf-8');
                if (databaseManager.importData(data)) {
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'Import Successful',
                    message: 'Your anime data has been imported successfully!'
                  });
                  mainWindow.reload();
                } else {
                  throw new Error('Invalid data format');
                }
              } catch (error) {
                dialog.showErrorBox('Import Failed', 'Failed to import data: ' + error.message);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create settings window
function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    width: 600,
    height: 500,
    parent: mainWindow,
    modal: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  settingsWindow.loadFile('settings.html'); // We'll create this
  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });
}

// IPC Handlers for communication with renderer
function setupIPC() {
  // Settings IPC
  ipcMain.handle('get-settings', () => {
    return settingsManager.getAll();
  });

  ipcMain.handle('update-settings', (event, updates) => {
    settingsManager.update(updates);
    return settingsManager.getAll();
  });

  // Database IPC
  ipcMain.handle('get-all-anime', () => {
    return databaseManager.getAllAnime();
  });

  ipcMain.handle('add-anime', (event, anime) => {
    return databaseManager.addAnime(anime);
  });

  ipcMain.handle('update-anime', (event, id, updates) => {
    return databaseManager.updateAnime(id, updates);
  });

  ipcMain.handle('delete-anime', (event, id) => {
    return databaseManager.deleteAnime(id);
  });

  ipcMain.handle('search-anime', (event, query) => {
    return databaseManager.searchAnime(query);
  });

  ipcMain.handle('get-stats', () => {
    return databaseManager.getStats();
  });

  ipcMain.handle('get-watchlist', () => {
    return databaseManager.getWatchlist();
  });

  ipcMain.handle('add-to-watchlist', (event, animeId) => {
    databaseManager.addToWatchlist(animeId);
    return true;
  });

  ipcMain.handle('remove-from-watchlist', (event, animeId) => {
    databaseManager.removeFromWatchlist(animeId);
    return true;
  });

  ipcMain.handle('get-favorites', () => {
    return databaseManager.getFavorites();
  });

  ipcMain.handle('add-to-favorites', (event, animeId) => {
    databaseManager.addToFavorites(animeId);
    return true;
  });

  ipcMain.handle('remove-from-favorites', (event, animeId) => {
    databaseManager.removeFromFavorites(animeId);
    return true;
  });

  // API IPC Handlers
  ipcMain.handle('search-api-anime', async (event, query, limit) => {
    try {
      return await apiManager.searchAnime(query, limit);
    } catch (error) {
      console.error('API search error:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('get-anime-details', async (event, animeId) => {
    try {
      return await apiManager.getAnimeDetails(animeId);
    } catch (error) {
      console.error('API details error:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('get-top-anime', async (event, type, limit) => {
    try {
      return await apiManager.getTopAnime(type, limit);
    } catch (error) {
      console.error('API top anime error:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('get-seasonal-anime', async (event, year, season, limit) => {
    try {
      return await apiManager.getSeasonalAnime(year, season, limit);
    } catch (error) {
      console.error('API seasonal anime error:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('get-random-anime', async (event) => {
    try {
      return await apiManager.getRandomAnime();
    } catch (error) {
      console.error('API random anime error:', error);
      return { error: error.message };
    }
  });

  ipcMain.handle('add-api-anime-to-library', async (event, apiAnime) => {
    try {
      // Convert API anime format to local database format
      const localAnime = {
        title: apiAnime.title,
        englishTitle: apiAnime.englishTitle || '',
        episodes: apiAnime.episodes || 0,
        status: 'Not Started',
        rating: 0,
        genres: apiAnime.genres || [],
        description: apiAnime.synopsis || '',
        image: apiAnime.image || '',
        apiId: apiAnime.id,
        apiScore: apiAnime.score || 0,
        year: apiAnime.year || null,
        type: apiAnime.type || '',
        studios: apiAnime.studios || []
      };
      
      return databaseManager.addAnime(localAnime);
    } catch (error) {
      console.error('Error adding API anime to library:', error);
      return { error: error.message };
    }
  });
}

app.whenReady().then(() => {
  // Initialize managers
  settingsManager = new SettingsManager();
  databaseManager = new DatabaseManager();
  apiManager = new APIManager();
  
  // Setup IPC
  setupIPC();
  
  // Create UI
  createMenu();
  createWindow();
});

// Quit when all windows are closed
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