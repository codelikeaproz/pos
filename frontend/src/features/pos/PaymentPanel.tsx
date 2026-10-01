import { Alert } from '../../components/feedback/Alert'
import { Button } from '../../components/ui/Button'
import { formatPesoCents, moneyToCents } from '../../lib/posCalculations'
import type { Customer } from '../../types/customer'
import './payment.css'

type Props = {
  total: string
  cashReceived: string
  change: string
  error: string | null
  processing: boolean
  disabled: boolean
  paymentMethod: 'cash' | 'credit'
  customer: Customer | null
  onCashSelect: () => void
  onCreditSelect: () => void
  onSelectCustomer: () => void
  onPay: () => void
}

export function PaymentPanel({ total, cashReceived, change, error, processing, disabled, paymentMethod, customer, onCashSelect, onCreditSelect, onSelectCustomer, onPay }: Props) {
  const cashDisplay = cashReceived ? formatPesoCents(moneyToCents(cashReceived) ?? 0n) : '—'
  return <section className="pos-payment">
    <h3 className="pos-payment__heading">Mode of Payment</h3>
    <button type="button" className={`pos-payment__method pos-payment__method--cash${paymentMethod === 'cash' ? ' pos-payment__method--active' : ''}`} aria-pressed={paymentMethod === 'cash'} disabled={processing} onClick={onCashSelect}>F3 - Cash</button>
    <div className="pos-payment__total"><span>Total Amount</span><strong>{total}</strong></div>
    <button type="button" className={`pos-payment__method pos-payment__method--credit${paymentMethod === 'credit' ? ' pos-payment__method--active' : ''}`} aria-pressed={paymentMethod === 'credit'} disabled={processing} onClick={onCreditSelect}>F4 - Credit / Utang</button>
    {paymentMethod === 'cash' ? <><div className="pos-payment__cash"><span>Cash Received</span><strong>{cashDisplay}</strong></div><div className="pos-payment__change"><span>Change</span><strong>{change}</strong></div></> : <div className="pos-payment__customer"><span>Customer</span>{customer ? <p><strong>{customer.name}</strong><br />{customer.address}</p> : <p>Select a Customer to record this sale as Credit / Utang.</p>}<Button variant="outline" onClick={onSelectCustomer}>{customer ? 'Change Customer' : 'Select Customer'}</Button></div>}
    {error ? <Alert tone="warning">{error}</Alert> : null}
    <Button disabled={disabled || processing} onClick={onPay}>{processing ? 'Processing…' : paymentMethod === 'cash' ? 'Pay' : 'Submit Credit'}</Button>
  </section>
}
