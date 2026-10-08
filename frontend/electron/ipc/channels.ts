export const APP_GET_INFO = 'app:getInfo' as const
export const CASH_DRAWER_OPEN = 'cashDrawer:open' as const
export const PRINTERS_GET = 'printers:get' as const
export const RECEIPT_PRINT = 'receipt:print' as const

export type AppIpcChannel = typeof APP_GET_INFO | typeof CASH_DRAWER_OPEN | typeof PRINTERS_GET | typeof RECEIPT_PRINT
