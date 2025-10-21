module.exports = {
  appId: "com.vanguard.app",
  productName: "Vanguard",
  directories: {
    output: "release"
  },
  files: [
    "dist/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  win: {
    target: "nsis"
  },
  mac: {
    target: "dmg"
  },
  linux: {
    target: "AppImage"
  }
};
