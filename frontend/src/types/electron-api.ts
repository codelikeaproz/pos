export type AppInfo = {
  name: string
  version: string
  platform: string
}

export type ElectronAPI = {
  getAppInfo: () => Promise<AppInfo>
  getPrinters: () => Promise<Array<{ name: string; displayName: string; description: string }>>
  printReceipt: (receipt: import('./pos').CheckoutOrder) => Promise<{ status: 'success' | 'cancelled' | 'error'; message: string }>
}
