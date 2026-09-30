import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SearchField } from '../components/ui/SearchField'
import { Pagination } from '../components/ui/Pagination'
import { Label } from '../components/ui/Label'
import { useAuth } from '../features/auth/AuthContext'
import { AvailableItemsTable } from '../features/pos/AvailableItemsTable'
import { CurrentOrderTable } from '../features/pos/CurrentOrderTable'
import { CustomerSelector } from '../features/pos/CustomerSelector'
import { PaymentPanel } from '../features/pos/PaymentPanel'
import { PosStationInventoryDialog } from '../features/pos/PosStationInventoryDialog'
import { PosTransactionsDialog } from '../features/pos/PosTransactionsDialog'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { addOneToQuantity, cartTotalCents, formatPesoCents, formatQuantity, moneyToCents, normalizeQuantity, validateCartQuantity } from '../lib/posCalculations'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { checkoutOrder, loadPosItems } from '../services/posService'
import type { CartItem, CheckoutOrder, PosItem, PosItemList } from '../types/pos'
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
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [transactionsOpen, setTransactionsOpen] = useState(false)
  const [stationInventoryOpen, setStationInventoryOpen] = useState(false)
  const [cashReceived, setCashReceived] = useState('')
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

  const total = useMemo(() => cartTotalCents(cart), [cart])
  const cashCents = useMemo(() => moneyToCents(cashReceived), [cashReceived])
  const changeCents = cashCents !== null && cashCents >= total ? cashCents - total : 0n
  const stationId = list.station.id || currentUser?.station?.id || 0

  function addItem(item: PosItem): void {
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.itemId === item.id)
      const nextQuantity = existing ? addOneToQuantity(existing.quantity) : '1.000'
      if (!nextQuantity) { showToast('Unable to update quantity.', 'info'); return current }
      const validationError = validateCartQuantity(nextQuantity, item.available_quantity)
      if (validationError) { showToast(validationError, 'info'); return current }
      if (existing) return current.map((cartItem) => cartItem.itemId === item.id ? { ...cartItem, quantity: nextQuantity, availableQuantity: item.available_quantity } : cartItem)
      return [...current, { itemId: item.id, itemCode: item.item_code, name: item.name, unit: item.unit, unitPrice: item.price, quantity: nextQuantity, availableQuantity: item.available_quantity }]
    })
  }

  function openQuantityEditor(item: CartItem): void {
    setEditing(item); setQuantityInput(formatQuantity(item.quantity)); setQuantityError(null)
  }

  function chooseQuantity(): void {
    if (cart.length === 0) { showToast('Add an item before changing quantity.', 'info'); return }
    if (cart.length === 1) { openQuantityEditor(cart[0]); return }
    setQuantityPickerOpen(true)
  }

  function openTransactions(): void {
    if (!stationId) { showToast('This account is not assigned to a Station.', 'info'); return }
    setTransactionsOpen(true)
  }

  function changePaymentMethod(method: 'cash' | 'credit'): void {
    setPaymentError(null)
    if (method === 'credit') { setCustomerSelectorOpen(true); return }
    setPaymentMethod('cash'); setSelectedCustomer(null)
  }

  function closeCustomerSelector(): void {
    setCustomerSelectorOpen(false)
    if (!selectedCustomer) setPaymentMethod('cash')
  }

  function updateQuantity(): void {
    if (!editing) return
    const validationError = validateCartQuantity(quantityInput, editing.availableQuantity)
    if (validationError) { setQuantityError(validationError); return }
    const normalizedQuantity = normalizeQuantity(quantityInput)
    if (!normalizedQuantity) { setQuantityError('Enter a valid quantity.'); return }
    setCart((current) => current.map((item) => item.itemId === editing.itemId ? { ...item, quantity: normalizedQuantity } : item))
    setEditing(null); setQuantityError(null)
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
      if (editing || quantityPickerOpen || newOrderOpen || exitOpen || customerSelectorOpen || transactionsOpen || stationInventoryOpen || completedOrder || processingPayment) return
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
    setCart([]); setCashReceived(''); setPaymentMethod('cash'); setSelectedCustomer(null); setPaymentError(null); setEditing(null); setQuantityPickerOpen(false); setNewOrderOpen(false); showToast('New order ready.', 'info')
  }

  async function pay(): Promise<void> {
    if (processingPayment || cart.length === 0) return
    if (paymentMethod === 'cash' && cashCents === null) { setPaymentError('Enter a valid Cash amount with no more than two decimal places.'); return }
    if (paymentMethod === 'cash' && cashCents !== null && cashCents < total) { setPaymentError('Cash received is less than the order total.'); return }
    if (paymentMethod === 'credit' && !selectedCustomer) { setPaymentError('Select a Customer for Credit / Utang.'); setCustomerSelectorOpen(true); return }
    setProcessingPayment(true); setPaymentError(null)
    try {
      const order = await checkoutOrder(cart, paymentMethod, cashReceived, selectedCustomer?.id ?? null)
      setCompletedOrder(order); setCart([]); setCashReceived(''); setPaymentMethod('cash'); setSelectedCustomer(null)
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
    {error ? <div className="pos-page__notice"><Alert tone="warning" title="POS items could not be loaded">{error}</Alert></div> : <div className="pos-layout">
      <div className="pos-left-column"><div className="pos-brand-stage" role="img" aria-label="Freshly prepared meals" /><section className="pos-panel pos-inventory"><div className="pos-panel__heading"><div><h2>Available Items</h2><p>{list.total} item{list.total === 1 ? '' : 's'} assigned to this Station</p></div></div><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search items or codes..." label="Search available items" />{loading ? <LoadingState label="Loading available items…" /> : <AvailableItemsTable items={list.items} onAdd={addItem} />}{!loading && <Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Available Item" onPageChange={setPage} />}</section><p className="pos-clock">{currentTime}</p></div>
      <section className="pos-right-column"><div className="pos-transaction-top"><div><span className="pos-transaction-top__label">Transaction Number</span><strong>Assigned after payment</strong></div><div><span className="pos-transaction-top__label">Customer</span><strong>{paymentMethod === 'credit' ? selectedCustomer?.name ?? 'Select Customer' : 'Walk-in'}</strong></div></div><section className="pos-panel pos-order"><div className="pos-panel__heading"><div><h2>Current Order</h2><p>{cart.length} item{cart.length === 1 ? '' : 's'} in cart</p></div></div><div className="pos-order__table"><CurrentOrderTable items={cart} onEdit={openQuantityEditor} onRemove={(itemId) => setCart((current) => current.filter((item) => item.itemId !== itemId))} /></div></section><PaymentPanel total={formatPesoCents(total)} cashReceived={cashReceived} change={formatPesoCents(changeCents)} paymentMethod={paymentMethod} customer={selectedCustomer} onMethodChange={changePaymentMethod} onSelectCustomer={() => setCustomerSelectorOpen(true)} error={paymentError} processing={processingPayment} disabled={cart.length === 0} onCashChange={(value) => { setCashReceived(value); setPaymentError(null) }} onPay={() => void pay()} /></section>
    </div>}
    <footer className="pos-action-strip"><div className="pos-action-strip__shortcuts"><button type="button" onClick={openTransactions} disabled={processingPayment}>F7 · View Transactions</button><button type="button" onClick={chooseQuantity} disabled={processingPayment}>F9 · Qty</button><button type="button" onClick={startNewOrder} disabled={processingPayment}>F10 · New Order</button><button type="button" onClick={() => setStationInventoryOpen(true)} disabled={processingPayment}>F12 · Station Inventory</button></div><button type="button" className="pos-action-strip__exit" onClick={exitPos} disabled={processingPayment}>Esc · Exit POS</button></footer>
    <Modal open={editing !== null} title="Change Quantity" onClose={() => setEditing(null)} actions={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={updateQuantity} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>Update</Button></>}><div className="pos-quantity-dialog"><p><strong>{editing?.name}</strong></p><p>Available: {editing ? formatQuantity(editing.availableQuantity) : ''} {editing?.unit}</p><div><Label htmlFor="cart-quantity" required>Quantity</Label><Input id="cart-quantity" type="number" inputMode="decimal" min="0.001" step="0.001" value={quantityInput} onChange={(event) => { setQuantityInput(event.target.value); setQuantityError(null) }} error={Boolean(quantityError)} autoFocus />{quantityError ? <span className="page__field-error">{quantityError}</span> : null}</div></div></Modal>
    <Modal open={quantityPickerOpen} title="Choose Item for Quantity" onClose={() => setQuantityPickerOpen(false)} actions={<Button variant="outline" onClick={() => setQuantityPickerOpen(false)}>Cancel</Button>}><div className="pos-quantity-picker">{cart.map((item) => <button key={item.itemId} type="button" onClick={() => { setQuantityPickerOpen(false); openQuantityEditor(item) }}><strong>{item.name}</strong><span>{item.itemCode} · {formatQuantity(item.quantity)} {item.unit}</span></button>)}</div></Modal>
    <Modal open={newOrderOpen} title="Start New Order?" onClose={() => setNewOrderOpen(false)} actions={<><Button variant="outline" onClick={() => setNewOrderOpen(false)}>Cancel</Button><Button onClick={clearCart} icon={<AppIcons.newOrder size={iconSize} strokeWidth={iconStroke} />}>Start New Order</Button></>}><div className="pos-new-order-warning"><AppIcons.warning size={24} /><p>The current order contains items that have not been paid. Starting a new order will clear the current cart.</p></div></Modal>
    <Modal open={exitOpen} title="Exit POS?" onClose={() => setExitOpen(false)} actions={<><Button variant="outline" onClick={() => setExitOpen(false)}>Stay in POS</Button><Button onClick={() => navigate('/dashboard')}>Exit POS</Button></>}><p>The current cart has not been submitted. Exiting POS will discard it.</p></Modal>
    <CustomerSelector open={customerSelectorOpen} selected={selectedCustomer} onClose={closeCustomerSelector} onSelect={(customer) => { setSelectedCustomer(customer); setPaymentMethod('credit'); setPaymentError(null); setCustomerSelectorOpen(false) }} />
    <PosTransactionsDialog open={transactionsOpen} stationId={stationId} onClose={() => setTransactionsOpen(false)} />
    <PosStationInventoryDialog open={stationInventoryOpen} onClose={() => setStationInventoryOpen(false)} />
    <Modal open={completedOrder !== null} title="Order Successful" onClose={() => setCompletedOrder(null)} actions={<Button onClick={() => setCompletedOrder(null)} icon={<AppIcons.success size={iconSize} strokeWidth={iconStroke} />}>Done</Button>}><div className="pos-payment-success"><AppIcons.success size={48} strokeWidth={iconStroke} /><dl><div><dt>Order Number</dt><dd>{completedOrder?.orderNumber}</dd></div><div><dt>Total</dt><dd>{completedOrder ? `₱${completedOrder.totalAmount}` : ''}</dd></div>{completedOrder?.paymentMethod === 'credit' ? <><div><dt>Payment Method</dt><dd>Credit / Utang</dd></div><div><dt>Customer</dt><dd>{completedOrder.customer?.name}</dd></div></> : <><div><dt>Cash</dt><dd>{completedOrder?.cashReceived ? `₱${completedOrder.cashReceived}` : ''}</dd></div><div><dt>Change</dt><dd>{completedOrder?.changeAmount ? `₱${completedOrder.changeAmount}` : ''}</dd></div></>}</dl></div></Modal>
  </section>
}
