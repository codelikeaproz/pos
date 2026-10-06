import { useEffect, useState } from 'react'
import { Alert } from '../../components/feedback/Alert'
import { LoadingState } from '../../components/feedback/LoadingState'
import { Modal } from '../../components/feedback/Modal'
import { Button } from '../../components/ui/Button'
import { Pagination } from '../../components/ui/Pagination'
import { SearchField } from '../../components/ui/SearchField'
import { getUserFacingApiMessage } from '../../services/apiClient'
import { loadCustomers } from '../../services/customerService'
import type { Customer, CustomerList } from '../../types/customer'
import './customer-selector.css'

const EMPTY: CustomerList = { customers: [], currentPage: 1, lastPage: 1, total: 0 }

export function CustomerSelector({ open, selected, onClose, onSelect }: { open: boolean; selected: Customer | null; onClose: () => void; onSelect: (customer: Customer | null) => void }) {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState(EMPTY)
  const [choice, setChoice] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (!open) return; const timer = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(timer) }, [open, searchInput])
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    setLoading(true); setError(null)
    void loadCustomers(search, page, 15, controller.signal).then(setList).catch((failure) => { if (!controller.signal.aborted) setError(getUserFacingApiMessage(failure)) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [open, search, page])
  useEffect(() => { if (open) setChoice(selected) }, [open, selected])

  return <Modal open={open} title="Select Customer" onClose={onClose} actions={<Button onClick={() => onSelect(choice)}>Select</Button>}>
    <div className="pos-customer-selector">
      <SearchField value={searchInput} onChange={setSearchInput} onClear={() => setSearchInput('')} placeholder="Search name or address..." label="Search Customers" />
      {error ? <Alert tone="error">{error}</Alert> : null}
      {loading ? <LoadingState label="Loading Customers…" /> : <div className="pos-customer-selector__results" role="group" aria-label="Customers">{list.customers.length > 0 ? <div className="pos-customer-selector__header" aria-hidden="true"><span></span><span>Customer</span><span>Address</span></div> : null}{list.customers.map((customer) => { const checked = choice?.id === customer.id; return <label key={customer.id} className="pos-customer-selector__row"><input type="checkbox" checked={checked} onChange={() => setChoice(checked ? null : customer)} /><strong>{customer.name}</strong><span>{customer.address}</span></label> })}{list.customers.length === 0 ? <p>No Customers found.</p> : null}</div>}
      <Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Customer" onPageChange={setPage} />
    </div>
  </Modal>
}
