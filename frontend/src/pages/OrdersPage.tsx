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
import { PaymentPanel } from '../features/pos/PaymentPanel'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { addOneToQuantity, cartTotalCents, formatPesoCents, formatQuantity, moneyToCents, normalizeQuantity, validateCartQuantity } from '../lib/posCalculations'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { checkoutOrder, loadPosItems } from '../services/posService'
import type { CartItem, CheckoutOrder, PosItem, PosItemList } from '../types/pos'
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
  const [quantityInput, setQuantityInput] = useState('')
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const [newOrderOpen, setNewOrderOpen] = useState(false)
  const [cashReceived, setCashReceived] = useState('')
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<CheckoutOrder | null>(null)

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
    if (cart.length === 0) { setCart([]); showToast('New order ready.', 'info'); return }
    setNewOrderOpen(true)
  }

  function clearCart(): void {
    setCart([]); setCashReceived(''); setPaymentError(null); setEditing(null); setNewOrderOpen(false); showToast('New order ready.', 'info')
  }

  async function pay(): Promise<void> {
    if (processingPayment || cart.length === 0) return
    if (cashCents === null) { setPaymentError('Enter a valid Cash amount with no more than two decimal places.'); return }
    if (cashCents < total) { setPaymentError('Cash received is less than the order total.'); return }
    setProcessingPayment(true); setPaymentError(null)
    try {
      const order = await checkoutOrder(cart, cashReceived)
      setCompletedOrder(order); setCart([]); setCashReceived('')
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

  return <section className="page pos-page">
    <header className="page__header pos-page__header"><div><h1 className="page__title">POS</h1><p className="page__description">Build a new order using inventory from your assigned Station.</p></div><div className="pos-header-actions"><Button variant="outline" onClick={() => navigate('/transactions')} icon={<AppIcons.consignment size={iconSize} strokeWidth={iconStroke} />}>View Transactions</Button><Button variant="outline" onClick={startNewOrder} icon={<AppIcons.newOrder size={iconSize} strokeWidth={iconStroke} />}>New Order</Button></div></header>
    <div className="pos-context"><div><span>Station</span><strong>{stationName}</strong></div><div><span>User</span><strong>{currentUser?.name ?? 'Unknown user'}</strong></div></div>
    {error ? <div className="pos-page__notice"><Alert tone="warning" title="POS items could not be loaded">{error}</Alert></div> : <div className="pos-layout">
      <section className="pos-panel"><div className="pos-panel__heading"><div><h2>Available Items</h2><p>{list.total} item{list.total === 1 ? '' : 's'} assigned to this Station</p></div></div><SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search items..." label="Search available items" />{loading ? <LoadingState label="Loading available items…" /> : <AvailableItemsTable items={list.items} onAdd={addItem} />}{!loading && <Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Available Item" onPageChange={setPage} />}</section>
      <section className="pos-panel pos-order"><div className="pos-panel__heading"><div><h2>Current Order</h2><p>{cart.length} item{cart.length === 1 ? '' : 's'} in cart</p></div></div><CurrentOrderTable items={cart} onEdit={openQuantityEditor} onRemove={(itemId) => setCart((current) => current.filter((item) => item.itemId !== itemId))} /><div className="pos-total"><span>Total</span><strong>{formatPesoCents(total)}</strong></div><PaymentPanel total={formatPesoCents(total)} cashReceived={cashReceived} change={formatPesoCents(changeCents)} error={paymentError} processing={processingPayment} disabled={cart.length === 0} onCashChange={(value) => { setCashReceived(value); setPaymentError(null) }} onPay={() => void pay()} /></section>
    </div>}
    <p className="pos-page__footnote">The cart remains temporary until payment succeeds. Completed payments permanently deduct the assigned Station inventory.</p>
    <Modal open={editing !== null} title="Change Quantity" onClose={() => setEditing(null)} actions={<><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={updateQuantity} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>Update</Button></>}><div className="pos-quantity-dialog"><p><strong>{editing?.name}</strong></p><p>Available: {editing ? formatQuantity(editing.availableQuantity) : ''} {editing?.unit}</p><div><Label htmlFor="cart-quantity" required>Quantity</Label><Input id="cart-quantity" type="number" inputMode="decimal" min="0.001" step="0.001" value={quantityInput} onChange={(event) => { setQuantityInput(event.target.value); setQuantityError(null) }} error={Boolean(quantityError)} autoFocus />{quantityError ? <span className="page__field-error">{quantityError}</span> : null}</div></div></Modal>
    <Modal open={newOrderOpen} title="Start New Order?" onClose={() => setNewOrderOpen(false)} actions={<><Button variant="outline" onClick={() => setNewOrderOpen(false)}>Cancel</Button><Button onClick={clearCart} icon={<AppIcons.newOrder size={iconSize} strokeWidth={iconStroke} />}>Start New Order</Button></>}><div className="pos-new-order-warning"><AppIcons.warning size={24} /><p>The current order contains items that have not been paid. Starting a new order will clear the current cart.</p></div></Modal>
    <Modal open={completedOrder !== null} title="Payment Successful" onClose={() => setCompletedOrder(null)} actions={<Button onClick={() => setCompletedOrder(null)} icon={<AppIcons.success size={iconSize} strokeWidth={iconStroke} />}>Done</Button>}><div className="pos-payment-success"><AppIcons.success size={48} strokeWidth={iconStroke} /><dl><div><dt>Order Number</dt><dd>{completedOrder?.orderNumber}</dd></div><div><dt>Total</dt><dd>{completedOrder ? `₱${completedOrder.totalAmount}` : ''}</dd></div><div><dt>Cash</dt><dd>{completedOrder ? `₱${completedOrder.cashReceived}` : ''}</dd></div><div><dt>Change</dt><dd>{completedOrder ? `₱${completedOrder.changeAmount}` : ''}</dd></div></dl></div></Modal>
  </section>
}
