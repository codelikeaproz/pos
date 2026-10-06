import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { useAuth } from '../features/auth/AuthContext'
import { CurrentOrderTable } from '../features/pos/CurrentOrderTable'
import { CashReceivedDialog } from '../features/pos/CashReceivedDialog'
import { CustomerSelector } from '../features/pos/CustomerSelector'
import { PaymentPanel } from '../features/pos/PaymentPanel'
import { PaymentReceipt } from '../features/pos/PaymentReceipt'
import { PosItemSearch } from '../features/pos/PosItemSearch'
import { PosStationInventoryDialog } from '../features/pos/PosStationInventoryDialog'
import { PosTransactionsDialog } from '../features/pos/PosTransactionsDialog'
import { SeniorDiscountDialog } from '../features/pos/SeniorDiscountDialog'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { addOneToQuantity, cartTotalCents, formatPesoCents, formatPosQuantity, formatQuantity, moneyToCents, normalizeQuantity, quantityToThousandths, seniorDiscountCents, validateCartQuantity, validateManualQuantity } from '../lib/posCalculations'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { checkoutOrder, loadPosItems } from '../services/posService'
import type { CartItem, CheckoutOrder, PosItem, PosItemList, SeniorDiscount } from '../types/pos'
import type { Customer } from '../types/customer'
import './orders-page.css'
import '../features/pos/header-actions.css'

const EMPTY_LIST: PosItemList = { items: [], station: { id: 0, name: '' }, currentPage: 1, lastPage: 1, total: 0 }

export function OrdersPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const [list, setList] = useState(EMPTY_LIST)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [editing, setEditing] = useState<CartItem | null>(null)
  const [quantityPickerOpen, setQuantityPickerOpen] = useState(false)
  const [quantityInput, setQuantityInput] = useState('')
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [transactionsOpen, setTransactionsOpen] = useState(false)
  const [orTransactionsOpen, setOrTransactionsOpen] = useState(false)
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [seniorDiscount, setSeniorDiscount] = useState<SeniorDiscount | null>(null)
  const [stationInventoryOpen, setStationInventoryOpen] = useState(false)
  const [cashReceived, setCashReceived] = useState('')
  const [cashDialogOpen, setCashDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSelectorOpen, setCustomerSelectorOpen] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<CheckoutOrder | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const loadItems = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadPosItems(search, page, signal)) }
    catch (loadError) { if (!signal?.aborted) { setList(EMPTY_LIST); setError(getUserFacingApiMessage(loadError)) } }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [page, search])

  useEffect(() => {
    const timeout = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    void loadItems(controller.signal)
    return () => controller.abort()
  }, [loadItems])

  const subtotal = useMemo(() => cartTotalCents(cart), [cart])
  const discount = useMemo(() => seniorDiscount ? seniorDiscountCents(subtotal, seniorDiscount.customerCount, seniorDiscount.seniorCount) : 0n, [seniorDiscount, subtotal])
  const total = subtotal - discount
  const cashCents = useMemo(() => moneyToCents(cashReceived), [cashReceived])
  const changeCents = cashCents !== null && cashCents >= total ? cashCents - total : null
  const cashNeedsCorrection = paymentMethod === 'cash' && cashCents !== null && cashCents < total
  const stationId = list.station.id || currentUser?.station?.id || 0

  useEffect(() => {
    if (cart.length === 0 && seniorDiscount) setSeniorDiscount(null)
  }, [cart.length, seniorDiscount])

  function addItem(item: PosItem): boolean {
    const existing = cart.find((cartItem) => cartItem.itemId === item.id)
    const nextQuantity = existing ? addOneToQuantity(existing.quantity) : '1.000'
    if (!nextQuantity) { showToast('Unable to update quantity.', 'info'); return false }
    const validationError = validateCartQuantity(nextQuantity, item.available_quantity)
    if (validationError) { showToast(validationError, 'info'); return false }
    setCart(existing
      ? cart.map((cartItem) => cartItem.itemId === item.id ? { ...cartItem, quantity: nextQuantity, availableQuantity: item.available_quantity } : cartItem)
      : [...cart, { itemId: item.id, itemCode: item.item_code, name: item.name, unit: item.unit, unitPrice: item.price, quantity: nextQuantity, availableQuantity: item.available_quantity }])
    setSearchInput(''); setSearch(''); setPage(1)
    return true
  }

  function openQuantityEditor(item: CartItem): void {
    setEditing(item); setQuantityInput(formatPosQuantity(item.quantity)); setQuantityError(null)
  }

  useEffect(() => {
    if (!editing) return
    const frame = window.requestAnimationFrame(() => {
      quantityInputRef.current?.focus()
      quantityInputRef.current?.select()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [editing])

  function chooseQuantity(): void {
    if (cart.length === 0) { showToast('Add an item before changing quantity.', 'info'); return }
    if (cart.length === 1) { openQuantityEditor(cart[0]); return }
    setQuantityPickerOpen(true)
  }

  function openTransactions(): void {
    if (!stationId) { showToast('This account is not assigned to a Station.', 'info'); return }
    setTransactionsOpen(true)
  }

  function openOrTransactions(): void {
    if (!stationId) { showToast('This account is not assigned to a Station.', 'info'); return }
    setOrTransactionsOpen(true)
  }

  function openDiscount(): void {
    if (cart.length === 0) { showToast('Add an item before applying a discount.', 'info'); return }
    setDiscountDialogOpen(true)
  }

  const closeCashDialog = useCallback(() => setCashDialogOpen(false), [])

  function openCashDialog(): void {
    setPaymentError(null)
    setCashDialogOpen(true)
  }

  function openCreditDialog(): void {
    setPaymentError(null)
    setCustomerSelectorOpen(true)
  }

  function closeCustomerSelector(): void {
    setCustomerSelectorOpen(false)
    if (!selectedCustomer) setPaymentMethod('cash')
  }

  function updateQuantity(): void {
    if (!editing) return
    const validationError = validateManualQuantity(quantityInput, editing.availableQuantity)
    if (validationError) { setQuantityError(validationError); return }
    const normalizedQuantity = normalizeQuantity(quantityInput)
    if (!normalizedQuantity) { setQuantityError('Enter a valid quantity.'); return }
    setCart((current) => current.map((item) => item.itemId === editing.itemId ? { ...item, quantity: normalizedQuantity } : item))
    setEditing(null); setQuantityError(null)
  }

  function stepQuantity(direction: 1 | -1): void {
    if (!editing) return
    const current = quantityInput.trim() ? quantityToThousandths(quantityInput) : 0n
    if (current === null) { setQuantityError('Enter a valid quantity before using the arrows.'); return }
    const next = current + BigInt(direction) * 1000n
    if (next <= 0n) { setQuantityError('Quantity must be greater than zero.'); return }
    const nextValue = formatPosQuantity(`${next / 1000n}.${(next % 1000n).toString().padStart(3, '0')}`)
    const validationError = validateCartQuantity(nextValue, editing.availableQuantity)
    if (validationError) { setQuantityError(validationError); return }
    setQuantityInput(nextValue); setQuantityError(null)
  }

  function startNewOrder(): void {
    if (cart.length === 0) { clearCart(); return }
    setNewOrderOpen(true)
  }

  function exitPos(): void {
    if (cart.length > 0) { setExitOpen(true); return }
    navigate('/dashboard')
  }

  useEffect(() => {
    function onShortcut(event: KeyboardEvent): void {
      const discountShortcut = event.ctrlKey && event.key.toLowerCase() === 'd'
      if (discountShortcut) event.preventDefault()
      if (editing || quantityPickerOpen || newOrderOpen || exitOpen || cashDialogOpen || customerSelectorOpen || discountDialogOpen || orTransactionsOpen || transactionsOpen || stationInventoryOpen || completedOrder || processingPayment) return
      if (discountShortcut) { openDiscount(); return }
      if (event.key === 'F3') { event.preventDefault(); openCashDialog() }
      if (event.key === 'F4') { event.preventDefault(); openCreditDialog() }
      if (event.key === 'F6') { event.preventDefault(); openOrTransactions() }
      if (event.key === 'F7') { event.preventDefault(); openTransactions() }
      if (event.key === 'F9') { event.preventDefault(); chooseQuantity() }
      if (event.key === 'F10') { event.preventDefault(); startNewOrder() }
      if (event.key === 'F12') { event.preventDefault(); setStationInventoryOpen(true) }
      if (event.key === 'Escape') { event.preventDefault(); exitPos() }
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  })

  function clearCart(): void {
    setCart([]); setCashReceived(''); setPaymentMethod('cash'); setSelectedCustomer(null); setSeniorDiscount(null); setPaymentError(null); setEditing(null); setQuantityPickerOpen(false); setNewOrderOpen(false); showToast('New order ready.', 'info')
  }

  async function pay(): Promise<void> {
    if (processingPayment || cart.length === 0) return
    if (paymentMethod === 'cash' && (cashCents === null || cashCents < total)) { openCashDialog(); return }
    if (paymentMethod === 'credit' && !selectedCustomer) { setPaymentError('Select a Customer for Credit / Utang.'); setCustomerSelectorOpen(true); return }
    setProcessingPayment(true); setPaymentError(null)
    try {
      const order = await checkoutOrder(cart, paymentMethod, cashReceived, selectedCustomer?.id ?? null, seniorDiscount)
      setCompletedOrder(order); setCart([]); setCashReceived(''); setPaymentMethod('cash'); setSelectedCustomer(null); setSeniorDiscount(null)
      await loadItems()
    } catch (checkoutError) {
      setPaymentError(getUserFacingApiMessage(checkoutError))
      if (checkoutError instanceof ApiError && checkoutError.status === 409 && checkoutError.currentPrices.length > 0) {
        const prices = new Map(checkoutError.currentPrices.map(({ itemId, price }) => [itemId, price]))
        setCart((current) => current.map((item) => ({ ...item, unitPrice: prices.get(item.itemId) ?? item.unitPrice })))
        await loadItems()
      } else if (checkoutError instanceof ApiError && checkoutError.status === 422) await loadItems()
    } finally { setProcessingPayment(false) }
  }

  const stationName = list.station.name || currentUser?.station?.name || 'Not assigned'
  const currentTime = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'full', timeStyle: 'medium' }).format(now)

  return <section className="page pos-page">
    <header className="pos-masthead"><div><p className="pos-masthead__eyebrow">POINT OF SALE AND INVENTORY SYSTEM</p><h1>CMU HomeStay</h1></div><div className="pos-masthead__identity"><span>Station: <strong>{stationName}</strong></span><span>User: <strong>{currentUser?.name ?? 'Unknown user'}</strong></span></div></header>
    <div className="pos-layout">
      <div className="pos-left-column"><section className="pos-panel pos-inventory"><div className="pos-panel__heading"><div><h2>Available Items</h2><p>{list.total} item{list.total === 1 ? '' : 's'} assigned to this Station</p></div></div><PosItemSearch inline value={searchInput} search={search} list={list} loading={loading} error={error} suspended={Boolean(editing || quantityPickerOpen || newOrderOpen || exitOpen || cashDialogOpen || customerSelectorOpen || discountDialogOpen || orTransactionsOpen || transactionsOpen || stationInventoryOpen || completedOrder || processingPayment)} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} onPageChange={setPage} onAdd={addItem} /></section></div>
      <section className="pos-right-column"><div className="pos-transaction-top"><div><span className="pos-transaction-top__label">Transaction Number</span><strong>Assigned after payment</strong></div><div><span className="pos-transaction-top__label">Customer</span><strong>{paymentMethod === 'credit' ? selectedCustomer?.name ?? 'Select Customer' : 'Walk-in'}</strong></div></div><section className="pos-panel pos-order"><div className="pos-panel__heading"><div><h2>Current Order</h2><p>{cart.length} item{cart.length === 1 ? '' : 's'} in cart</p></div></div><div className="pos-order__table"><CurrentOrderTable items={cart} onEdit={openQuantityEditor} onRemove={(itemId) => setCart((current) => current.filter((item) => item.itemId !== itemId))} /></div></section><PaymentPanel subtotal={formatPesoCents(subtotal)} discount={formatPesoCents(discount)} total={formatPesoCents(total)} cashReceived={cashReceived} change={changeCents === null ? '—' : formatPesoCents(changeCents)} paymentMethod={paymentMethod} customer={selectedCustomer} onCashSelect={openCashDialog} onCreditSelect={openCreditDialog} error={paymentError ?? (cashNeedsCorrection ? 'Cash Received is below the current total. Press F3 to update it.' : null)} processing={processingPayment} disabled={cart.length === 0} onPay={() => void pay()} /></section>
    </div>
    <footer className="pos-action-strip"><time className="pos-action-strip__clock" dateTime={now.toISOString()}>{currentTime}</time><div className="pos-action-strip__shortcuts"><button type="button" onClick={openDiscount} disabled={processingPayment}>Ctrl+D · Apply Discount</button><button type="button" onClick={openOrTransactions} disabled={processingPayment}>F6 · O.R Transactions</button><button type="button" onClick={openTransactions} disabled={processingPayment}>F7 · Current Station Transactions</button><button type="button" onClick={chooseQuantity} disabled={processingPayment}>F9 · Qty</button><button type="button" onClick={startNewOrder} disabled={processingPayment}>F10 · New Order</button><button type="button" onClick={() => setStationInventoryOpen(true)} disabled={processingPayment}>F12 · Station Inventory</button></div><button type="button" className="pos-action-strip__exit" onClick={exitPos} disabled={processingPayment}>Esc · Exit POS</button></footer>
    <Modal open={editing !== null} title="Change Quantity" onClose={() => setEditing(null)} actions={<Button onClick={updateQuantity} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>Update Quantity</Button>}><div className="pos-quantity-dialog">
      <div className="modal-summary__grid">
        <div className="modal-summary__field"><span>Item</span><strong>{editing?.name}</strong></div>
        <div className="modal-summary__field"><span>Item Code</span><strong>{editing?.itemCode}</strong></div>
        <div className="modal-summary__field"><span>Current Qty</span><strong>{editing ? `${formatPosQuantity(editing.quantity)} ${editing.unit}` : ''}</strong></div>
        <div className="modal-summary__field"><span>Available Stock</span><strong>{editing ? `${formatQuantity(editing.availableQuantity)} ${editing.unit}` : ''}</strong></div>
      </div>
      <div className="pos-quantity-dialog__entry"><Label htmlFor="cart-quantity" required>New Quantity</Label><div className="pos-quantity-control"><Input ref={quantityInputRef} id="cart-quantity" type="text" inputMode="decimal" autoComplete="off" value={quantityInput} onChange={(event) => { setQuantityInput(event.target.value); setQuantityError(null) }} onKeyDown={(event) => { if (event.nativeEvent.isComposing) return; if (event.key === 'Enter') { event.preventDefault(); updateQuantity() } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); stepQuantity(event.key === 'ArrowUp' ? 1 : -1) } }} error={Boolean(quantityError)} /><div className="pos-quantity-control__steps"><button type="button" aria-label="Increase quantity by one" title="Increase by one" onClick={() => { stepQuantity(1); quantityInputRef.current?.focus() }}>▲</button><button type="button" aria-label="Decrease quantity by one" title="Decrease by one" onClick={() => { stepQuantity(-1); quantityInputRef.current?.focus() }}>▼</button></div></div>{quantityError ? <span className="page__field-error">{quantityError}</span> : null}<p>Type the quantity and press Enter to update.</p></div>
    </div></Modal>
    <Modal open={quantityPickerOpen} title="Select Item to Change Quantity" onClose={() => setQuantityPickerOpen(false)}><div className="pos-quantity-picker">
      <p className="pos-quantity-picker__hint">Choose an Item from the current order.</p>
      <div className="pos-quantity-picker__header" aria-hidden="true"><span>Item</span><span>Item Code</span><span>Current Qty</span></div>
      <div className="pos-quantity-picker__list">{cart.map((item) => <button key={item.itemId} type="button" aria-label={`Change quantity for ${item.name}`} onClick={() => { setQuantityPickerOpen(false); openQuantityEditor(item) }}><span>{item.name}</span><span>{item.itemCode}</span><span>{formatPosQuantity(item.quantity)} {item.unit}</span></button>)}</div>
    </div></Modal>
    <Modal open={newOrderOpen} title="Start New Order?" onClose={() => setNewOrderOpen(false)} actions={<Button onClick={clearCart} icon={<AppIcons.newOrder size={iconSize} strokeWidth={iconStroke} />}>Start New Order</Button>}><div className="pos-new-order-warning"><AppIcons.warning size={24} /><p>The current order contains items that have not been paid. Starting a new order will clear the current cart.</p></div></Modal>
    <Modal open={exitOpen} title="Exit POS?" onClose={() => setExitOpen(false)} actions={<Button onClick={() => navigate('/dashboard')}>Exit POS</Button>}><p>The current cart has not been submitted. Exiting POS will discard it.</p></Modal>
    <CashReceivedDialog open={cashDialogOpen} totalCents={total} currentAmount={cashReceived} onClose={closeCashDialog} onConfirm={(amount) => { setCashReceived(amount); setPaymentMethod('cash'); setSelectedCustomer(null); setPaymentError(null); setCashDialogOpen(false) }} />
    <SeniorDiscountDialog open={discountDialogOpen} subtotalCents={subtotal} value={seniorDiscount} onClose={() => setDiscountDialogOpen(false)} onApply={(value) => { setSeniorDiscount(value); setDiscountDialogOpen(false); setPaymentError(null) }} onRemove={() => { setSeniorDiscount(null); setDiscountDialogOpen(false); setPaymentError(null) }} />
    <CustomerSelector open={customerSelectorOpen} selected={selectedCustomer} onClose={closeCustomerSelector} onSelect={(customer) => { setSelectedCustomer(customer); setPaymentMethod('credit'); setCashReceived(''); setPaymentError(customer ? null : 'Select a Customer before submitting Credit / Utang.'); setCustomerSelectorOpen(false) }} />
    <PosTransactionsDialog open={orTransactionsOpen} stationId={stationId} mode="or" onClose={() => setOrTransactionsOpen(false)} />
    <PosTransactionsDialog open={transactionsOpen} stationId={stationId} onClose={() => setTransactionsOpen(false)} />
    <PosStationInventoryDialog open={stationInventoryOpen} onClose={() => setStationInventoryOpen(false)} />
    <Modal open={completedOrder !== null} title="Receipt Preview" onClose={() => setCompletedOrder(null)} actions={<Button onClick={() => window.print()} icon={<AppIcons.print size={iconSize} strokeWidth={iconStroke} />}>Print Receipt</Button>}>{completedOrder ? <PaymentReceipt order={completedOrder} /> : null}</Modal>
  </section>
}
