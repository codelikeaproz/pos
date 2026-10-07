import { contextBridge, ipcRenderer } from 'electron'
import { APP_GET_INFO, PRINTERS_GET, RECEIPT_PRINT, TEST_PRINT } from './ipc/channels'
import type { AppInfo } from './ipc/app'
import type { PrintResult, ReceiptPrintData } from './ipc/printing'

export type ElectronAPI = {
  getAppInfo: () => Promise<AppInfo>
  getPrinters: () => Promise<Array<{ name: string; displayName: string; description: string }>>
  printReceipt: (receipt: ReceiptPrintData) => Promise<PrintResult>
  printTestPage: () => Promise<PrintResult>
}

const electronAPI: ElectronAPI = {
  getAppInfo: (): Promise<AppInfo> => ipcRenderer.invoke(APP_GET_INFO),
  getPrinters: () => ipcRenderer.invoke(PRINTERS_GET),
  printReceipt: (receipt) => ipcRenderer.invoke(RECEIPT_PRINT, receipt),
  printTestPage: () => ipcRenderer.invoke(TEST_PRINT)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
