import { app, BrowserWindow, ipcMain } from 'electron'
import { PRINTERS_GET, RECEIPT_PRINT, TEST_PRINT } from './channels'

export const RECEIPT_COLUMNS = 32

type ReceiptItem = {
  itemCode: string
  itemName: string
  unit: string
  quantity: string
  unitPrice: string
  subtotal: string
}

export type ReceiptPrintData = {
  orderNumber: string
  orderedAt: string
  paymentMethod: 'cash' | 'credit'
  subtotalAmount: string
  discountAmount: string
  totalAmount: string
  customerCount: number | null
  seniorCount: number | null
  cashReceived: string | null
  changeAmount: string | null
  station: { name: string }
  cashier: { name: string }
  customer: { name: string } | null
  items: ReceiptItem[]
}

export type PrintResult = { status: 'success' | 'cancelled' | 'error'; message: string }

const text = (value: unknown, maximum = 160): string => typeof value === 'string' ? value.trim().slice(0, maximum) : ''
const money = (value: string): string => `PHP ${Number(value).toFixed(2)}`
const quantity = (value: string): string => Number(value).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
const line = (label: string, value: string): string => `${label}${value.padStart(Math.max(1, RECEIPT_COLUMNS - label.length))}`
const wrap = (value: string): string[] => value.replace(/\s+/g, ' ').match(new RegExp(`.{1,${RECEIPT_COLUMNS}}`, 'g')) ?? ['']
const decimal = (value: string): boolean => /^\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value))

function parseReceipt(value: unknown): ReceiptPrintData | null {
  if (!value || typeof value !== 'object') return null
  const order = value as Record<string, unknown>
  const party = (candidate: unknown): { name: string } | null => {
    if (!candidate || typeof candidate !== 'object') return null
    const name = text((candidate as Record<string, unknown>).name)
    return name ? { name } : null
  }
  const items = Array.isArray(order.items) ? order.items.map((candidate): ReceiptItem | null => {
    if (!candidate || typeof candidate !== 'object') return null
    const item = candidate as Record<string, unknown>
    const parsed = {
      itemCode: text(item.itemCode, 80), itemName: text(item.itemName), unit: text(item.unit, 40),
      quantity: text(item.quantity, 30), unitPrice: text(item.unitPrice, 30), subtotal: text(item.subtotal, 30)
    }
    return parsed.itemName && [parsed.quantity, parsed.unitPrice, parsed.subtotal].every(decimal) ? parsed : null
  }) : []
  const paymentMethod = order.paymentMethod === 'cash' || order.paymentMethod === 'credit' ? order.paymentMethod : null
  const station = party(order.station)
  const cashier = party(order.cashier)
  const customer = party(order.customer)
  const parsed = {
    orderNumber: text(order.orderNumber, 100), orderedAt: text(order.orderedAt, 50), paymentMethod,
    subtotalAmount: text(order.subtotalAmount, 30), discountAmount: text(order.discountAmount, 30), totalAmount: text(order.totalAmount, 30),
    customerCount: Number.isInteger(order.customerCount) ? order.customerCount as number : null,
    seniorCount: Number.isInteger(order.seniorCount) ? order.seniorCount as number : null,
    cashReceived: order.cashReceived === null ? null : text(order.cashReceived, 30),
    changeAmount: order.changeAmount === null ? null : text(order.changeAmount, 30), station, cashier, customer,
    items: items.filter((item): item is ReceiptItem => item !== null)
  }
  const amounts = [parsed.subtotalAmount, parsed.discountAmount, parsed.totalAmount, ...(paymentMethod === 'cash' ? [parsed.cashReceived, parsed.changeAmount] : [])]
  if (!parsed.orderNumber || !Date.parse(parsed.orderedAt) || !paymentMethod || !station || !cashier || (paymentMethod === 'credit' && !customer) || parsed.items.length !== items.length || parsed.items.length === 0 || amounts.some((amount) => !amount || !decimal(amount))) return null
  return parsed as ReceiptPrintData
}

export function formatPrintReceipt(order: ReceiptPrintData): string {
  const rule = '-'.repeat(RECEIPT_COLUMNS)
  const output = [
    'CMU HOMESTAY'.padStart((RECEIPT_COLUMNS + 12) / 2),
    'SALES RECEIPT'.padStart((RECEIPT_COLUMNS + 13) / 2), '',
    ...wrap(`Station : ${order.station.name}`), ...wrap(`Txn No. : ${order.orderNumber}`),
    ...wrap(`Date    : ${new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.orderedAt))}`),
    ...wrap(`Cashier : ${order.cashier.name}`), ...wrap(`Customer: ${order.customer?.name ?? 'Walk-in'}`),
    `Payment : ${order.paymentMethod === 'credit' ? 'CREDIT / UTANG' : 'CASH'}`, rule
  ]
  for (const item of order.items) {
    output.push(...wrap(item.itemName), ...wrap(`  ${quantity(item.quantity)} ${item.unit} x ${money(item.unitPrice)}`), line('  Item total', money(item.subtotal)))
  }
  output.push(rule, line('Subtotal', money(order.subtotalAmount)))
  if (Number(order.discountAmount) > 0) {
    output.push(line('Senior Discount', `-${money(order.discountAmount)}`), line('Customers', String(order.customerCount ?? 0)), line('Senior Citizens', String(order.seniorCount ?? 0)))
  }
  output.push(line('TOTAL', money(order.totalAmount)))
  if (order.paymentMethod === 'cash') output.push(line('Cash Received', money(order.cashReceived!)), line('Change', money(order.changeAmount!)))
  output.push(rule, '', 'Thank you for your purchase!'.padStart((RECEIPT_COLUMNS + 28) / 2), '', '')
  return output.join('\n')
}

const escapeHtml = (value: string): string => value.replace(/[&<>]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]!)

async function printText(content: string): Promise<PrintResult> {
  const printWindow = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true } })
  try {
    const html = `<!doctype html><meta charset="utf-8"><title>Receipt</title><style>@page{margin:0}body{box-sizing:border-box;width:58mm;margin:0;padding:2mm 3mm 0 5mm;color:#000;background:#fff;font:9pt/1.25 "Courier New",monospace;white-space:pre-wrap}pre{margin:0}</style><pre>${escapeHtml(content)}</pre>`
    await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
    return await new Promise((resolve) => printWindow.webContents.print({ silent: false, printBackground: false, margins: { marginType: 'printableArea' } }, (success, failureReason) => {
      if (success) resolve({ status: 'success', message: 'Receipt was sent to the selected printer.' })
      else if (/cancel/i.test(failureReason)) resolve({ status: 'cancelled', message: 'Printing was cancelled. The completed Order remains saved.' })
      else resolve({ status: 'error', message: `Printing failed${failureReason ? `: ${failureReason}` : '.'} The completed Order remains saved.` })
    }))
  } catch (error) {
    return { status: 'error', message: `Printing failed: ${error instanceof Error ? error.message : 'Unable to load print document'}. The completed Order remains saved.` }
  } finally {
    if (!printWindow.isDestroyed()) printWindow.destroy()
  }
}

export function registerPrintingIpc(): void {
  ipcMain.handle(PRINTERS_GET, async (event) => (await event.sender.getPrintersAsync()).map(({ name, displayName, description }) => ({ name, displayName, description })))
  ipcMain.handle(RECEIPT_PRINT, async (_event, value: unknown): Promise<PrintResult> => {
    const order = parseReceipt(value)
    return order ? printText(formatPrintReceipt(order)) : { status: 'error', message: 'Printing failed: invalid receipt data. The completed Order remains saved.' }
  })
  ipcMain.handle(TEST_PRINT, async (): Promise<PrintResult> => app.isPackaged
    ? { status: 'error', message: 'The test page is available only in development.' }
    : printText(['CMU HOMESTAY', 'PRINTER TEST', '', `Date: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`, '-'.repeat(RECEIPT_COLUMNS), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0123456789', '-'.repeat(RECEIPT_COLUMNS), '', ''].join('\n')))
}
