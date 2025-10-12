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

  // External API Integration
  searchAPIAnime: (query, limit = 10) => ipcRenderer.invoke('search-api-anime', query, limit),
  getAnimeDetails: (animeId) => ipcRenderer.invoke('get-anime-details', animeId),
  getTopAnime: (type = 'all', limit = 25) => ipcRenderer.invoke('get-top-anime', type, limit),
  getSeasonalAnime: (year, season, limit = 25) => ipcRenderer.invoke('get-seasonal-anime', year, season, limit),
  getRandomAnime: () => ipcRenderer.invoke('get-random-anime'),
  addAPIAnimeToLibrary: (apiAnime) => ipcRenderer.invoke('add-api-anime-to-library', apiAnime),

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