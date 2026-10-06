import { formatQuantity, quantityToThousandths } from '../../lib/posCalculations'
import { Badge } from './Badge'

type Props = {
  quantity: string
  unit?: string
  isLowStock: boolean
}

export function StockQuantity({ quantity, unit, isLowStock }: Props) {
  const amount = quantityToThousandths(quantity) ?? 0n
  const displayedQuantity = `${formatQuantity(quantity)}${unit ? ` ${unit}` : ''}`

  if (amount <= 0n) return <Badge tone="error">Out of Stock · {displayedQuantity}</Badge>
  if (isLowStock) return <Badge tone="warning">Low Stock · {displayedQuantity}</Badge>

  return <span>{displayedQuantity}</span>
}
