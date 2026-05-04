import { createMMKV } from "react-native-mmkv";

// Simple memory fallback for environments where native modules are not available
const memoryStorage = new Map<string, string>();

let mmkv: any = null;
try {
  mmkv = createMMKV();
} catch (e) {
  console.warn("Failed to initialize MMKV, using memory fallback:", e);
}

/**
 * A safe wrapper around MMKV that falls back to in-memory storage 
 * if the native module is missing or fails.
 */
export const safeAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (mmkv) {
        return mmkv.getString(key) || null;
      }
      return memoryStorage.get(key) || null;
    } catch (e) {
      console.warn(`Storage.getItem failed for key "${key}", using memory fallback:`, e);
      return memoryStorage.get(key) || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (mmkv) {
        mmkv.set(key, value);
      } else {
        memoryStorage.set(key, value);
      }
    } catch (e) {
      console.warn(`Storage.setItem failed for key "${key}", using memory fallback:`, e);
      memoryStorage.set(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (mmkv) {
        mmkv.delete(key);
      } else {
        memoryStorage.delete(key);
      }
    } catch (e) {
      console.warn(`Storage.removeItem failed for key "${key}", using memory fallback:`, e);
      memoryStorage.delete(key);
    }
  },
  clear: async (): Promise<void> => {
    try {
      if (mmkv) {
        mmkv.clearAll();
      } else {
        memoryStorage.clear();
      }
    } catch (e) {
      console.warn("Storage.clear failed, using memory fallback:", e);
      memoryStorage.clear();
    }
  },
  getAllKeys: async (): Promise<readonly string[]> => {
    try {
      if (mmkv) {
        return mmkv.getAllKeys();
      }
      return Array.from(memoryStorage.keys());
    } catch (e) {
      console.warn("Storage.getAllKeys failed, using memory fallback:", e);
      return Array.from(memoryStorage.keys());
    }
  }
};
