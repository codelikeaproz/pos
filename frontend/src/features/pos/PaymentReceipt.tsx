import { formatPosQuantity, formatPrice } from '../../lib/posCalculations'
import type { CheckoutOrder } from '../../types/pos'
import './payment-receipt.css'

export function PaymentReceipt({ order }: { order: CheckoutOrder }) {
  return <div className="pos-receipt" aria-label={`Receipt for transaction ${order.orderNumber}`}>
    <header className="pos-receipt__header">
      <strong>CMU HomeStay</strong>
      <span>{order.station.name}</span>
    </header>

    <div className="pos-receipt__transaction">
      <span>Transaction Number:</span>
      <strong>{order.orderNumber}</strong>
    </div>

    <div className="pos-receipt__items">
      {order.items.map((item) => <div key={`${item.itemId}-${item.itemCode}`} className="pos-receipt__item">
        <div className="pos-receipt__item-name">{item.itemName}</div>
        <div className="pos-receipt__item-line">
          <span>{formatPosQuantity(item.quantity)} × {formatPrice(item.unitPrice)}</span>
          <span>{formatPrice(item.subtotal)}</span>
        </div>
      </div>)}
    </div>

    <div className="pos-receipt__total">
      <span>Subtotal</span><strong>{formatPrice(order.subtotalAmount)}</strong>
      {Number(order.discountAmount) > 0 ? <><span>Senior Discount</span><strong>-{formatPrice(order.discountAmount)}</strong><span>Customers / Seniors</span><strong>{order.customerCount} / {order.seniorCount}</strong></> : null}
      <span>Total</span><strong>{formatPrice(order.totalAmount)}</strong>
    </div>

    {order.paymentMethod === 'credit' && order.customer ? <div className="pos-receipt__customer">
      <span>Credit / Utang Customer</span>
      <strong>{order.customer.name}</strong>
    </div> : null}

    <p className="pos-receipt__thanks">Thank you for your purchase!</p>
  </div>
}
