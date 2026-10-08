import { ipcMain } from 'electron'
import { CASH_DRAWER_OPEN } from './channels'

export type CashDrawerResult = {
  status: 'success' | 'not_configured' | 'device_not_found' | 'controller_offline' | 'unsupported' | 'error'
  message: string
}

async function openCashDrawer(): Promise<CashDrawerResult> {
  return { status: 'not_configured', message: 'AQ405A cash drawer controller is not configured.' }
}

export function registerCashDrawerIpc(): void {
  ipcMain.handle(CASH_DRAWER_OPEN, openCashDrawer)
}
