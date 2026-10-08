import { formatPosQuantity, formatPrice } from '../../lib/posCalculations'
import { formatManilaDateTime } from '../../lib/dateTime'
import type { CheckoutOrder } from '../../types/pos'
import './payment-receipt.css'

export function PaymentReceipt({ order }: { order: CheckoutOrder }) {
  const discounted = Number(order.discountAmount) > 0

  return <div className="pos-receipt-preview" tabIndex={0} aria-label="Scrollable receipt preview">
    <article className="pos-receipt" aria-label={`Receipt for transaction ${order.orderNumber}`}>
      <header className="pos-receipt__header">
        <h3>CMU HomeStay</h3>
        <p>Sale Receipt</p>
      </header>

      <dl className="pos-receipt__metadata">
        <div><dt>Station</dt><dd>{order.station.name}</dd></div>
        <div><dt>Date</dt><dd>{formatManilaDateTime(order.orderedAt)}</dd></div>
        <div className="pos-receipt__transaction"><dt>Txn</dt><dd>{order.orderNumber}</dd></div>
        <div><dt>Cashier</dt><dd>{order.cashier.name}</dd></div>
        <div><dt>Customer</dt><dd>{order.customer?.name ?? 'Walk-in'}</dd></div>
        <div><dt>Payment</dt><dd>{order.paymentMethod === 'credit' ? 'Credit / Utang' : 'Cash'}</dd></div>
      </dl>

      <section className="pos-receipt__items" aria-label="Purchased items">
        {order.items.map((item) => <div key={`${item.itemId}-${item.itemCode}`} className="pos-receipt__item">
          <div className="pos-receipt__item-name">{item.itemName}</div>
          <div className="pos-receipt__item-line">
            <span>{formatPosQuantity(item.quantity)} × {formatPrice(item.unitPrice)}</span>
            <span>{formatPrice(item.subtotal)}</span>
          </div>
        </div>)}
      </section>

      <dl className="pos-receipt__totals">
        {discounted ? <>
          <div><dt>Subtotal</dt><dd>{formatPrice(order.subtotalAmount)}</dd></div>
          <div><dt>Senior Discount</dt><dd>-{formatPrice(order.discountAmount)}</dd></div>
          <div><dt>Customers / Seniors</dt><dd>{order.customerCount} / {order.seniorCount}</dd></div>
        </> : null}
        <div className="pos-receipt__grand-total"><dt>Total</dt><dd>{formatPrice(order.totalAmount)}</dd></div>
        {order.paymentMethod === 'cash' ? <>
          <div><dt>Cash Received</dt><dd>{formatPrice(order.cashReceived ?? '0.00')}</dd></div>
          <div><dt>Change</dt><dd>{formatPrice(order.changeAmount ?? '0.00')}</dd></div>
        </> : null}
      </dl>

      <footer className="pos-receipt__footer">Thank you for your purchase!</footer>
    </article>
  </div>
}
