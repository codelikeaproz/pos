import { Alert } from '../../components/feedback/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
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
  onMethodChange: (method: 'cash' | 'credit') => void
  onSelectCustomer: () => void
  onCashChange: (value: string) => void
  onPay: () => void
}

export function PaymentPanel({ total, cashReceived, change, error, processing, disabled, paymentMethod, customer, onMethodChange, onSelectCustomer, onCashChange, onPay }: Props) {
  return <section className="pos-payment">
    <div className="pos-payment__heading"><AppIcons.payment size={24} strokeWidth={iconStroke} /><div><h3>Payment</h3><p>Choose how this Order is paid</p></div></div>
    <fieldset className="pos-payment__methods"><legend>Payment Method</legend><label><input type="radio" name="payment-method" checked={paymentMethod === 'cash'} onChange={() => onMethodChange('cash')} /> Cash</label><label><input type="radio" name="payment-method" checked={paymentMethod === 'credit'} onChange={() => onMethodChange('credit')} /> Credit / Utang</label></fieldset>
    <div className="pos-payment__total"><span>Total Amount</span><strong>{total}</strong></div>
    {paymentMethod === 'cash' ? <><div><Label htmlFor="cash-received" required>Cash Received</Label><Input id="cash-received" type="number" inputMode="decimal" min="0" step="0.01" value={cashReceived} onChange={(event) => onCashChange(event.target.value)} error={Boolean(error)} placeholder="0.00" /></div><div className="pos-payment__change"><span>Change</span><strong>{change}</strong></div></> : <div className="pos-payment__customer"><span>Customer</span>{customer ? <p><strong>{customer.name}</strong><br />{customer.address}</p> : <p>Select a Customer to record this sale as Credit / Utang.</p>}<Button variant="outline" onClick={onSelectCustomer}>{customer ? 'Change Customer' : 'Select Customer'}</Button></div>}
    {error ? <Alert tone="warning">{error}</Alert> : null}
    <Button disabled={disabled || processing} onClick={onPay} icon={<AppIcons.payment size={iconSize} strokeWidth={iconStroke} />}>{processing ? 'Processing…' : paymentMethod === 'cash' ? 'Pay' : 'Submit Credit'}</Button>
  </section>
}
