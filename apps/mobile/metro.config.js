const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Find the project and workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and how to handle symlinks (important for pnpm)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Force Metro to resolve specific packages to the ones in the app's node_modules
// This prevents multiple instances of React or React Navigation in monorepos
config.resolver.extraNodeModules = {
  "react": path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  "@react-navigation/native": path.resolve(projectRoot, "node_modules/@react-navigation/native"),
  "expo-router": path.resolve(projectRoot, "node_modules/expo-router"),
};

// Improve stability with file watching
// (Watchman is usually automatically detected and used by Metro)

module.exports = withNativeWind(config, { input: "./src/global.css" });
