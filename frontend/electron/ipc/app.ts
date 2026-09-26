import { app, ipcMain } from 'electron'
import { APP_GET_INFO } from './channels'

export type AppInfo = {
  name: string
  version: string
  platform: string
}

export function registerAppIpc(): void {
  ipcMain.handle(APP_GET_INFO, (): AppInfo => {
    return {
      name: 'University HomeStay POS',
      version: app.getVersion(),
      platform: process.platform
    }
  })
}
