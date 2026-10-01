const QUANTITY_SCALE = 3
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

export function quantityToThousandths(value: string): bigint | null {
  return parseFixedDecimal(value, QUANTITY_SCALE)
}

export function addOneToQuantity(value: string): string | null {
  const quantity = quantityToThousandths(value)
  return quantity === null ? null : formatScaledInteger(quantity + 1000n, QUANTITY_SCALE)
}

export function normalizeQuantity(value: string): string | null {
  const quantity = quantityToThousandths(value)
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
  if (fraction === '000') return whole
  return fraction.endsWith('0') ? `${whole}.${fraction.slice(0, 2)}` : quantity
}

export function validateCartQuantity(value: string, availableQuantity: string): string | null {
  const quantity = quantityToThousandths(value)
  const available = quantityToThousandths(availableQuantity)

  if (quantity === null) return 'Enter a quantity with no more than three decimal places.'
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
  const quantityThousandths = quantityToThousandths(quantity) ?? 0n
  return (priceCents * quantityThousandths + 500n) / 1000n
}

export function cartTotalCents(items: Array<{ unitPrice: string; quantity: string }>): bigint {
  return items.reduce((total, item) => total + lineSubtotalCents(item.unitPrice, item.quantity), 0n)
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
