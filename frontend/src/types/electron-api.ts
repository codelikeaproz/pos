export type AppInfo = {
  name: string
  version: string
  platform: string
}

export type ElectronAPI = {
  getAppInfo: () => Promise<AppInfo>
  openCashDrawer: () => Promise<{ status: 'success' | 'not_configured' | 'device_not_found' | 'controller_offline' | 'unsupported' | 'error'; message: string }>
  getPrinters: () => Promise<Array<{ name: string; displayName: string; description: string }>>
  printReceipt: (receipt: import('./pos').CheckoutOrder) => Promise<{ status: 'success' | 'cancelled' | 'error'; message: string }>
}
