import { Alert } from '../../components/feedback/Alert'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import './payment.css'

type Props = {
  total: string
  cashReceived: string
  change: string
  error: string | null
  processing: boolean
  disabled: boolean
  onCashChange: (value: string) => void
  onPay: () => void
}

export function PaymentPanel({ total, cashReceived, change, error, processing, disabled, onCashChange, onPay }: Props) {
  return <section className="pos-payment">
    <div className="pos-payment__heading"><AppIcons.payment size={24} strokeWidth={iconStroke} /><div><h3>Payment</h3><p>Cash payment only</p></div></div>
    <div className="pos-payment__method"><span>Payment Method</span><strong>Cash</strong></div>
    <div className="pos-payment__total"><span>Total Amount</span><strong>{total}</strong></div>
    <div><Label htmlFor="cash-received" required>Cash Received</Label><Input id="cash-received" type="number" inputMode="decimal" min="0" step="0.01" value={cashReceived} onChange={(event) => onCashChange(event.target.value)} error={Boolean(error)} placeholder="0.00" /></div>
    <div className="pos-payment__change"><span>Change</span><strong>{change}</strong></div>
    {error ? <Alert tone="warning">{error}</Alert> : null}
    <Button disabled={disabled || processing} onClick={onPay} icon={<AppIcons.payment size={iconSize} strokeWidth={iconStroke} />}>{processing ? 'Processing…' : 'Pay'}</Button>
  </section>
}
