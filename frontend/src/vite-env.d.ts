/// <reference types="vite/client" />

declare module '*.css';

declare global {
  interface Window {
    lcode?: {
      appVersion: () => Promise<string>;
      openDirectory: (path: string) => Promise<string>;
      selectDirectory: () => Promise<string | null>;
      backendStatus: () => Promise<boolean>;
    };
  }
}

export {};
