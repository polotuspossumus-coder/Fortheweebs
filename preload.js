// Preload script for ForTheWeebs
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings API
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (updates) => ipcRenderer.invoke('update-settings', updates),

  // Anime Database API
  getAllAnime: () => ipcRenderer.invoke('get-all-anime'),
  addAnime: (anime) => ipcRenderer.invoke('add-anime', anime),
  updateAnime: (id, updates) => ipcRenderer.invoke('update-anime', id, updates),
  deleteAnime: (id) => ipcRenderer.invoke('delete-anime', id),
  searchAnime: (query) => ipcRenderer.invoke('search-anime', query),
  getStats: () => ipcRenderer.invoke('get-stats'),

  // Watchlist API
  getWatchlist: () => ipcRenderer.invoke('get-watchlist'),
  addToWatchlist: (animeId) => ipcRenderer.invoke('add-to-watchlist', animeId),
  removeFromWatchlist: (animeId) => ipcRenderer.invoke('remove-from-watchlist', animeId),

  // Favorites API
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  addToFavorites: (animeId) => ipcRenderer.invoke('add-to-favorites', animeId),
  removeFromFavorites: (animeId) => ipcRenderer.invoke('remove-from-favorites', animeId),

  // Utility functions
  showNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },

  // Version info
  getVersion: () => '1.0.0',
  getPlatform: () => process.platform
});