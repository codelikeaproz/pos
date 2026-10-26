const QUANTITY_SCALE = 2
const PRICE_SCALE = 2

function parseFixedDecimal(value: string, scale: number): bigint | null {
  const normalized = value.trim()
  const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${scale}})?$`)
  if (!pattern.test(normalized)) return null

  const [whole, fraction = ''] = normalized.split('.')
  return BigInt(whole) * (10n ** BigInt(scale)) + BigInt(fraction.padEnd(scale, '0'))
}

function formatScaledInteger(value: bigint, scale: number): string {
  const divisor = 10n ** BigInt(scale)
  const whole = value / divisor
  const fraction = (value % divisor).toString().padStart(scale, '0')
  return `${whole}.${fraction}`
}

export function quantityToHundredths(value: string): bigint | null {
  return parseFixedDecimal(value, QUANTITY_SCALE)
}

export function addOneToQuantity(value: string): string | null {
  const quantity = quantityToHundredths(value)
  return quantity === null ? null : formatScaledInteger(quantity + 100n, QUANTITY_SCALE)
}

export function normalizeQuantity(value: string): string | null {
  const quantity = quantityToHundredths(value)
  return quantity === null ? null : formatScaledInteger(quantity, QUANTITY_SCALE)
}

export function formatQuantity(value: string): string {
  const quantity = normalizeQuantity(value)
  if (!quantity) return value
  return quantity.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1')
}

export function formatPosQuantity(value: string): string {
  const quantity = normalizeQuantity(value)
  if (!quantity) return value
  const [whole, fraction] = quantity.split('.')
  if (fraction === '00') return whole
  return quantity
}

export function validateCartQuantity(value: string, availableQuantity: string): string | null {
  const quantity = quantityToHundredths(value)
  const available = quantityToHundredths(availableQuantity)

  if (quantity === null) return 'Enter a quantity with no more than two decimal places.'
  if (quantity <= 0n) return 'Quantity must be greater than zero.'
  if (available === null || quantity > available) return `Only ${formatQuantity(availableQuantity)} units are available at this station.`
  return null
}

export function validateManualQuantity(value: string, availableQuantity: string): string | null {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return 'Enter a quantity with no more than two decimal places.'
  return validateCartQuantity(value, availableQuantity)
}

export function lineSubtotalCents(unitPrice: string, quantity: string): bigint {
  const priceCents = parseFixedDecimal(unitPrice, PRICE_SCALE) ?? 0n
  const quantityHundredths = quantityToHundredths(quantity) ?? 0n
  return (priceCents * quantityHundredths + 50n) / 100n
}

export function cartTotalCents(items: Array<{ unitPrice: string; quantity: string }>): bigint {
  return items.reduce((total, item) => total + lineSubtotalCents(item.unitPrice, item.quantity), 0n)
}

export function seniorDiscountCents(subtotalCents: bigint, customerCount: number, seniorCount: number): bigint {
  if (!Number.isInteger(customerCount) || !Number.isInteger(seniorCount) || customerCount < 1 || seniorCount < 1 || seniorCount > customerCount) return 0n
  const denominator = BigInt(customerCount) * 5n
  return (subtotalCents * BigInt(seniorCount) + denominator / 2n) / denominator
}

export function formatPesoCents(cents: bigint): string {
  const whole = cents / 100n
  const fraction = (cents % 100n).toString().padStart(2, '0')
  return `₱${new Intl.NumberFormat('en-PH').format(whole)}.${fraction}`
}

export function formatPrice(price: string): string {
  const cents = parseFixedDecimal(price, PRICE_SCALE) ?? 0n
  return formatPesoCents(cents)
}

export function moneyToCents(value: string): bigint | null {
  return parseFixedDecimal(value, PRICE_SCALE)
}
