import { useEffect, useRef, useState } from 'react'
import { Modal } from '../../components/feedback/Modal'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { formatPesoCents, seniorDiscountCents } from '../../lib/posCalculations'
import type { SeniorDiscount } from '../../types/pos'

export function SeniorDiscountDialog({ open, subtotalCents, value, onClose, onApply, onRemove }: { open: boolean; subtotalCents: bigint; value: SeniorDiscount | null; onClose: () => void; onApply: (value: SeniorDiscount) => void; onRemove: () => void }) {
  const [customers, setCustomers] = useState('')
  const [seniors, setSeniors] = useState('')
  const [error, setError] = useState<string | null>(null)
  const customerRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setCustomers(value ? String(value.customerCount) : '')
    setSeniors(value ? String(value.seniorCount) : '')
    setError(null)
    const frame = window.requestAnimationFrame(() => customerRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open, value])

  const customerCount = /^\d+$/.test(customers) ? Number(customers) : 0
  const seniorCount = /^\d+$/.test(seniors) ? Number(seniors) : 0
  const discount = seniorDiscountCents(subtotalCents, customerCount, seniorCount)
  const finalTotal = subtotalCents - discount

  function apply(): void {
    if (!Number.isInteger(customerCount) || customerCount < 1) { setError('Number of Customers must be at least 1.'); return }
    if (!Number.isInteger(seniorCount) || seniorCount < 1) { setError('Number of Senior Citizens must be at least 1.'); return }
    if (seniorCount > customerCount) { setError('Number of Senior Citizens cannot exceed Number of Customers.'); return }
    onApply({ customerCount, seniorCount })
  }

  return <Modal open={open} title="Apply Discount" onClose={onClose} actions={<>{value ? <Button variant="outline" onClick={onRemove}>Remove Discount</Button> : null}<Button onClick={apply}>Apply Discount</Button></>}>
    <div className="senior-discount-dialog">
      <div><Label htmlFor="discount-customers" required>Number of Customers</Label><Input ref={customerRef} id="discount-customers" type="text" inputMode="numeric" value={customers} onChange={(event) => { setCustomers(event.target.value); setError(null) }} /></div>
      <div><Label htmlFor="discount-seniors" required>Number of Senior Citizens</Label><Input id="discount-seniors" type="text" inputMode="numeric" value={seniors} onChange={(event) => { setSeniors(event.target.value); setError(null) }} /></div>
      {error ? <p className="page__field-error">{error}</p> : null}
      <div className="modal-summary__grid">
        <div className="modal-summary__field"><span>Initial Price</span><strong>{formatPesoCents(subtotalCents)}</strong></div>
        <div className="modal-summary__field"><span>Discount</span><strong>-{formatPesoCents(discount)}</strong></div>
        <div className="modal-summary__field"><span>Final Total</span><strong>{formatPesoCents(finalTotal)}</strong></div>
      </div>
    </div>
  </Modal>
}
