import { useEffect, useRef, useState } from 'react'
import { Alert } from '../../components/feedback/Alert'
import { Modal } from '../../components/feedback/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { formatPesoCents, moneyToCents } from '../../lib/posCalculations'
import './cash-received-dialog.css'

type Props = {
  open: boolean
  totalCents: bigint
  currentAmount: string
  onClose: () => void
  onConfirm: (amount: string) => void
}

const MAX_CASH_FORMAT = /^\d{1,10}(?:\.\d{1,2})?$/

export function CashReceivedDialog({ open, totalCents, currentAmount, onClose, onConfirm }: Props) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setDraft(currentAmount)
    setError(null)
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open, currentAmount])

  const receivedCents = moneyToCents(draft)
  const changeCents = receivedCents !== null && receivedCents >= totalCents ? receivedCents - totalCents : null

  function confirm(): void {
    const cents = moneyToCents(draft)
    if (!MAX_CASH_FORMAT.test(draft) || cents === null) {
      setError('Enter a valid Cash amount with no more than two decimal places.')
      return
    }
    if (cents < totalCents) {
      setError('Cash received is less than the order total.')
      return
    }
    onConfirm(`${cents / 100n}.${(cents % 100n).toString().padStart(2, '0')}`)
  }

  return <Modal open={open} title="Cash Received" onClose={onClose} actions={<Button onClick={confirm}>Confirm Amount</Button>}>
    <div className="pos-cash-dialog">
      <div className="pos-cash-dialog__row"><span>Order Total</span><strong>{formatPesoCents(totalCents)}</strong></div>
      <div className="pos-cash-dialog__amount"><Label htmlFor="cash-received-dialog" required>Cash Received</Label><Input ref={inputRef} id="cash-received-dialog" type="text" inputMode="decimal" autoComplete="off" placeholder="0.00" value={draft} onChange={(event) => { setDraft(event.target.value); setError(null) }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); confirm() } }} error={Boolean(error)} aria-describedby="cash-received-hint" /></div>
      <div className="pos-cash-dialog__row"><span>Change</span><strong>{changeCents === null ? '—' : formatPesoCents(changeCents)}</strong></div>
      {error ? <Alert tone="warning">{error}</Alert> : null}
      <p id="cash-received-hint" className="pos-cash-dialog__hint">Enter the cash amount. Press Enter to confirm or Esc to cancel.</p>
    </div>
  </Modal>
}
