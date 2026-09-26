import type { ElectronAPI } from './types/electron-api'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }

  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
