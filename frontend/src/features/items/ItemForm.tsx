import { FormEvent, useState } from 'react'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { formatQuantity } from '../../lib/posCalculations'
import { ITEM_UNITS, type Item, type ItemInput } from '../../types/item'

export type ItemFieldErrors = Partial<Record<'item_code' | 'name' | 'quantity' | 'units_backup' | 'unit' | 'reorder_point' | 'price', string>>

type Props = { formId: string; item?: Item; errors: ItemFieldErrors; disabled?: boolean; onSubmit: (input: ItemInput) => void }

export function ItemForm({ formId, item, errors, disabled = false, onSubmit }: Props) {
  const [itemCode, setItemCode] = useState(item?.item_code ?? '')
  const [name, setName] = useState(item?.name ?? '')
  const [quantity, setQuantity] = useState(item ? formatQuantity(item.quantity) : '')
  const [unitsBackup, setUnitsBackup] = useState(item?.units_backup ?? 'pcs')
  const [price, setPrice] = useState(item?.price ?? '')

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSubmit({ item_code: itemCode.trim(), name: name.trim(), quantity: quantity.trim(), units_backup: unitsBackup.trim(), unit: item?.unit ?? unitsBackup.trim(), reorder_point: item?.reorder_point ?? '0', price: price.trim() })
  }

  return (
    <form id={formId} className="item-form" onSubmit={submit}>
      <div className="item-form__field">
        <Label htmlFor={`${formId}-item-code`} required>Item Code</Label>
        <Input id={`${formId}-item-code`} value={itemCode} onChange={(event) => setItemCode(event.target.value)} required maxLength={100} disabled={disabled} error={Boolean(errors.item_code)} aria-describedby={errors.item_code ? `${formId}-item-code-error` : undefined} placeholder="ITM-001" />
        {errors.item_code ? <span id={`${formId}-item-code-error`} className="page__field-error">{errors.item_code}</span> : null}
      </div>
      <div className="item-form__field">
        <Label htmlFor={`${formId}-name`} required>Item Name</Label>
        <Input id={`${formId}-name`} value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} disabled={disabled} error={Boolean(errors.name)} aria-describedby={errors.name ? `${formId}-name-error` : undefined} />
        {errors.name ? <span id={`${formId}-name-error`} className="page__field-error">{errors.name}</span> : null}
      </div>
      <div className="item-form__row">
        <div className="item-form__field">
          <Label htmlFor={`${formId}-quantity`} required>Quantity</Label>
          <Input id={`${formId}-quantity`} type="number" inputMode="decimal" min="0" step="0.001" value={quantity} onChange={(event) => setQuantity(event.target.value)} required disabled={disabled} error={Boolean(errors.quantity)} aria-describedby={errors.quantity ? `${formId}-quantity-error` : undefined} placeholder="0" />
          {errors.quantity ? <span id={`${formId}-quantity-error`} className="page__field-error">{errors.quantity}</span> : null}
        </div>
        <div className="item-form__field">
          <Label htmlFor={`${formId}-units-backup`} required>Unit</Label>
          <Input id={`${formId}-units-backup`} list={`${formId}-unit-suggestions`} value={unitsBackup} onChange={(event) => setUnitsBackup(event.target.value)} required maxLength={50} disabled={disabled} error={Boolean(errors.units_backup)} aria-describedby={errors.units_backup ? `${formId}-units-backup-error` : undefined} placeholder="Select or type a unit" />
          <datalist id={`${formId}-unit-suggestions`}>
            {ITEM_UNITS.map((option) => <option key={option} value={option} />)}
          </datalist>
          {errors.units_backup ? <span id={`${formId}-units-backup-error`} className="page__field-error">{errors.units_backup}</span> : null}
        </div>
      </div>
      <div className="item-form__field">
        <Label htmlFor={`${formId}-price`} required>Price</Label>
        <div className="item-form__price"><span aria-hidden="true">₱</span><Input id={`${formId}-price`} type="number" inputMode="decimal" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required disabled={disabled} error={Boolean(errors.price)} aria-describedby={errors.price ? `${formId}-price-error` : undefined} placeholder="0.00" /></div>
        {errors.price ? <span id={`${formId}-price-error`} className="page__field-error">{errors.price}</span> : null}
      </div>
    </form>
  )
}
