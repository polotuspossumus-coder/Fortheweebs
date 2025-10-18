// Settings Manager for ForTheWeebs
import fs from 'fs';
import path from 'path';
// Electron's app API is not available in Next.js. Replace with a static path or environment variable if needed.

export class SettingsManager {
  constructor() {
  // Replace Electron path with a static path for Next.js compatibility
  this.settingsPath = path.join('settings.json');
    this.defaultSettings = {
      theme: 'dark',
      autoStart: false,
      notifications: true,
      language: 'en',
      updateChannel: 'stable',
      windowSize: {
        width: 1280,
        height: 720
      },
      lastOpened: new Date().toISOString(),
      favoriteGenres: [],
      userPreferences: {
        showOnlyEnglishTitles: false,
        hideCompletedSeries: false,
        defaultView: 'grid'
      }
    };
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf-8');
        return { ...this.defaultSettings, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return { ...this.defaultSettings };
  }

  saveSettings() {
    try {
      const settingsDir = path.dirname(this.settingsPath);
      if (!fs.existsSync(settingsDir)) {
        fs.mkdirSync(settingsDir, { recursive: true });
      }
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  update(updates) {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  reset() {
    this.settings = { ...this.defaultSettings };
    this.saveSettings();
  }

  getAll() {
    return { ...this.settings };
  }
}

export default SettingsManager;