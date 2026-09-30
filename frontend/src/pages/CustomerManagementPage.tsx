import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { AppIcons, iconSize } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { addCustomer, loadCustomers } from '../services/customerService'
import type { Customer, CustomerList } from '../types/customer'
import './customer-management-page.css'

const EMPTY: CustomerList = { customers: [], currentPage: 1, lastPage: 1, total: 0 }
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })

export function CustomerManagementPage() {
  const { showToast } = useToast()
  const [list, setList] = useState(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setPageError(null)
    try { setList(await loadCustomers(search, page, signal)) }
    catch (failure) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(failure)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [search, page])
  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  function openAdd() { setName(''); setAddress(''); setFormError(null); setFieldErrors({}); setAddOpen(true) }
  async function save() {
    if (!name.trim() || !address.trim()) { setFormError('Enter the Customer name and address.'); return }
    setSubmitting(true); setFormError(null); setFieldErrors({})
    try {
      const response = await addCustomer(name.trim(), address.trim())
      setAddOpen(false); showToast(response.message)
      if (page === 1) await refresh(); else setPage(1)
    } catch (failure) {
      setFormError(getUserFacingApiMessage(failure))
      if (failure instanceof ApiError) setFieldErrors(failure.errors)
    } finally { setSubmitting(false) }
  }

  const columns: TableColumn<Customer>[] = [
    { key: 'id', header: 'ID', render: (row) => row.id },
    { key: 'name', header: 'Name', render: (row) => <strong>{row.name}</strong> },
    { key: 'address', header: 'Address', render: (row) => row.address },
    { key: 'balance', header: 'Balance', align: 'right', render: (row) => row.balance === null ? <span title="Accounting Office balance is unavailable in this POS">—</span> : money.format(Number(row.balance)) }
  ]

  return <section className="page customer-management-page">
    <header className="page__header"><div><h1 className="page__title">Customer Management</h1><p className="page__description">Browse and add Customers.</p></div><Button onClick={openAdd} icon={<AppIcons.add size={iconSize} />}>Add Customer</Button></header>
    <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search name or address..." label="Search Customers" />
    <p className="customer-management-page__balance-note">Balance is unavailable here because credit settlement is handled by the Accounting Office.</p>
    {pageError ? <Alert tone="error">{pageError}</Alert> : null}
    {loading ? <LoadingState label="Loading Customers…" /> : <><p className="page__description">{list.total} Customer{list.total === 1 ? '' : 's'}</p><Table columns={columns} rows={list.customers} rowKey={(row) => String(row.id)} emptyMessage="No Customers found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Customer" onPageChange={setPage} /></>}
    <Modal open={addOpen} title="Add Customer" onClose={() => { if (!submitting) setAddOpen(false) }} actions={<><Button variant="outline" disabled={submitting} onClick={() => setAddOpen(false)}>Cancel</Button><Button disabled={submitting} onClick={() => void save()} icon={<AppIcons.add size={iconSize} />}>Add Customer</Button></>}>
      <div className="customer-management-page__form"><Label htmlFor="customer-name" required>Customer Name</Label><Input id="customer-name" maxLength={255} value={name} onChange={(event) => setName(event.target.value)} error={Boolean(fieldErrors.name)} disabled={submitting} />{fieldErrors.name?.[0] ? <span className="page__field-error">{fieldErrors.name[0]}</span> : null}<Label htmlFor="customer-address" required>Address</Label><textarea id="customer-address" className="ui-input" maxLength={500} value={address} onChange={(event) => setAddress(event.target.value)} disabled={submitting} aria-invalid={Boolean(fieldErrors.address)} />{fieldErrors.address?.[0] ? <span className="page__field-error">{fieldErrors.address[0]}</span> : null}{formError ? <Alert tone="error">{formError}</Alert> : null}</div>
    </Modal>
  </section>
}
