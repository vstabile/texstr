import { isServer } from "solid-js/web";

// Mock storage for SSR environment
const mockStorage = {
  _data: new Map<string, string>(),
  getItem(key: string) {
    return this._data.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    this._data.set(key, value);
  },
  removeItem(key: string) {
    this._data.delete(key);
  },
  clear() {
    this._data.clear();
  },
};

// Storage singleton that works in both browser and SSR
export const storage = isServer ? mockStorage : window.localStorage;
