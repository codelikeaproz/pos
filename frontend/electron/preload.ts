import { contextBridge, ipcRenderer } from 'electron'
import { APP_GET_INFO } from './ipc/channels'
import type { AppInfo } from './ipc/app'

export type ElectronAPI = {
  getAppInfo: () => Promise<AppInfo>
}

const electronAPI: ElectronAPI = {
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(APP_GET_INFO)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
