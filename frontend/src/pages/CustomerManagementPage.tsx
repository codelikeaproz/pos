import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { AppIcons, iconSize } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { addCustomer, loadCustomers, updateCustomer, updateCustomerStatus } from '../services/customerService'
import type { Customer, CustomerInput, CustomerList } from '../types/customer'
import './customer-management-page.css'

const EMPTY: CustomerList = { customers: [], currentPage: 1, lastPage: 1, total: 0 }
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const blank = (): CustomerInput => ({ employee_number: null, first_name: '', middle_name: null, last_name: '', sex: null, birth_date: null, address: '', credit_limit: '500.00', is_active: true })

export function CustomerManagementPage() {
  const { showToast } = useToast()
  const [list, setList] = useState(EMPTY), [searchInput, setSearchInput] = useState(''), [search, setSearch] = useState('')
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [loading, setLoading] = useState(true), [pageError, setPageError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Customer | null>(null), [form, setForm] = useState<CustomerInput>(blank())
  const [modalOpen, setModalOpen] = useState(false), [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null), [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const refresh = useCallback(async (signal?: AbortSignal) => { setLoading(true); setPageError(null); try { setList(await loadCustomers(search, page, pageSize, signal)) } catch (failure) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(failure)) } finally { if (!signal?.aborted) setLoading(false) } }, [search, page, pageSize])
  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  function open(customer?: Customer) {
    setEditing(customer ?? null)
    setForm(customer ? { employee_number: customer.employeeNumber, first_name: customer.firstName, middle_name: customer.middleName, last_name: customer.lastName, sex: customer.sex, birth_date: customer.birthDate, address: customer.address, credit_limit: customer.creditLimit, is_active: customer.isActive } : blank())
    setFormError(null); setFieldErrors({}); setModalOpen(true)
  }
  function field<K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) { setForm((current) => ({ ...current, [key]: value })) }
  async function save() {
    setSubmitting(true); setFormError(null); setFieldErrors({})
    try { const response = editing ? await updateCustomer(editing.id, form) : await addCustomer(form); showToast(response.message); setModalOpen(false); await refresh() }
    catch (failure) { setFormError(getUserFacingApiMessage(failure)); if (failure instanceof ApiError) setFieldErrors(failure.errors) }
    finally { setSubmitting(false) }
  }
  async function toggle(customer: Customer) { try { const response = await updateCustomerStatus(customer.id, !customer.isActive); showToast(response.message); await refresh() } catch (failure) { showToast(getUserFacingApiMessage(failure), 'info') } }

  const columns: TableColumn<Customer>[] = [
    { key: 'employee', header: 'Employee No.', render: (row) => row.employeeNumber ?? '—' }, { key: 'name', header: 'Customer Name', render: (row) => row.name }, { key: 'sex', header: 'Sex', render: (row) => row.sex ? row.sex[0].toUpperCase() + row.sex.slice(1) : '—' }, { key: 'address', header: 'Address', render: (row) => row.address },
    { key: 'limit', header: 'Credit Limit', align: 'right', render: (row) => money.format(Number(row.creditLimit)) }, { key: 'outstanding', header: 'Outstanding', align: 'right', render: (row) => money.format(Number(row.outstandingBalance)) }, { key: 'available', header: 'Available', align: 'right', render: (row) => money.format(Number(row.availableCredit)) },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.isActive ? 'success' : 'error'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', render: (row) => <div className="table-actions"><Button variant="outline" className="table-icon-action" aria-label={`Edit ${row.name}`} onClick={() => open(row)} icon={<AppIcons.edit size={iconSize} />} /><Button variant="outline" className="table-icon-action" aria-label={`${row.isActive ? 'Deactivate' : 'Reactivate'} ${row.name}`} onClick={() => void toggle(row)} icon={row.isActive ? <AppIcons.deactivate size={iconSize} /> : <AppIcons.activate size={iconSize} />} /></div> }
  ]

  return <section className="page customer-management-page">
    <header className="page__header"><div><h1 className="page__title">Customer Management</h1><p className="page__description">Manage Customer details, status, and credit limits.</p></div><Button onClick={() => open()} icon={<AppIcons.add size={iconSize} />}>Add Customer</Button></header>
    <SearchField value={searchInput} onChange={setSearchInput} onClear={() => setSearchInput('')} placeholder="Search employee number, name, or address..." label="Search Customers" />
    {pageError ? <Alert tone="error">{pageError}</Alert> : null}{loading ? <LoadingState label="Loading Customers…" /> : <><Table columns={columns} rows={list.customers} rowKey={(row) => String(row.id)} emptyMessage="No Customers found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Customer" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} /></>}
    <Modal open={modalOpen} title={editing ? 'Edit Customer' : 'Add Customer'} onClose={() => !submitting && setModalOpen(false)} actions={<Button disabled={submitting} onClick={() => void save()}>{submitting ? 'Saving…' : 'Save Customer'}</Button>}><div className="customer-management-page__form">
      <Label htmlFor="customer-employee">Employee Number</Label><Input id="customer-employee" value={form.employee_number ?? ''} onChange={(e) => field('employee_number', e.target.value || null)} />
      <Label htmlFor="customer-first" required>First Name</Label><Input id="customer-first" value={form.first_name} onChange={(e) => field('first_name', e.target.value)} error={Boolean(fieldErrors.first_name)} />
      <Label htmlFor="customer-middle">Middle Name</Label><Input id="customer-middle" value={form.middle_name ?? ''} onChange={(e) => field('middle_name', e.target.value || null)} />
      <Label htmlFor="customer-last" required>Last Name</Label><Input id="customer-last" value={form.last_name} onChange={(e) => field('last_name', e.target.value)} error={Boolean(fieldErrors.last_name)} />
      <Label htmlFor="customer-sex">Sex</Label><select id="customer-sex" className="ui-input" value={form.sex ?? ''} onChange={(e) => field('sex', (e.target.value || null) as CustomerInput['sex'])}><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option></select>
      <Label htmlFor="customer-birth">Birth Date</Label><Input id="customer-birth" type="date" value={form.birth_date ?? ''} onChange={(e) => field('birth_date', e.target.value || null)} />
      <Label htmlFor="customer-address" required>Address</Label><textarea id="customer-address" className="ui-input" value={form.address} onChange={(e) => field('address', e.target.value)} />
      <Label htmlFor="customer-limit" required>Credit Limit</Label><Input id="customer-limit" inputMode="decimal" value={form.credit_limit} onChange={(e) => field('credit_limit', e.target.value)} />
      {formError ? <Alert tone="error">{formError}</Alert> : null}
    </div></Modal>
  </section>
}
