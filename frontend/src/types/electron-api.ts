export type AppInfo = {
  name: string
  version: string
  platform: string
}

export type ElectronAPI = {
  getAppInfo: () => Promise<AppInfo>
}
