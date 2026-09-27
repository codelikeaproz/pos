import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { SupplierForm, type SupplierFieldErrors } from '../features/suppliers/SupplierForm'
import { SupplierTable } from '../features/suppliers/SupplierTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createSupplier, deleteSupplier, loadSuppliers, updateSupplier } from '../services/supplierService'
import type { Supplier, SupplierInput, SupplierList } from '../types/supplier'
import './suppliers-page.css'

type FormDialog = { mode: 'create' } | { mode: 'edit'; supplier: Supplier }
const EMPTY_LIST: SupplierList = { suppliers: [], currentPage: 1, lastPage: 1, total: 0 }

function fieldErrorsFrom(error: unknown): SupplierFieldErrors {
  if (!(error instanceof ApiError)) return {}
  return {
    name: error.errors.name?.[0],
    contact_person: error.errors.contact_person?.[0],
    contact_number: error.errors.contact_number?.[0],
    email: error.errors.email?.[0],
    address: error.errors.address?.[0]
  }
}

export function SuppliersPage() {
  const { showToast } = useToast()
  const [supplierList, setSupplierList] = useState<SupplierList>(EMPTY_LIST)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formDialog, setFormDialog] = useState<FormDialog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SupplierFieldErrors>({})

  const refreshSuppliers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setPageError(null)
    try {
      setSupplierList(await loadSuppliers(search, page, signal))
    } catch (error) {
      if (!signal?.aborted) setPageError(getUserFacingApiMessage(error))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    void refreshSuppliers(controller.signal)
    return () => controller.abort()
  }, [refreshSuppliers])

  function closeForm(): void {
    if (!submitting) { setFormDialog(null); setFieldErrors({}); setFormError(null) }
  }

  async function save(input: SupplierInput): Promise<void> {
    if (!formDialog) return
    setSubmitting(true); setFieldErrors({}); setFormError(null)
    try {
      const response = formDialog.mode === 'create'
        ? await createSupplier(input)
        : await updateSupplier(formDialog.supplier.id, input)
      setFormDialog(null)
      showToast(response.message)
      await refreshSuppliers()
    } catch (error) {
      setFieldErrors(fieldErrorsFrom(error)); setFormError(getUserFacingApiMessage(error))
    } finally { setSubmitting(false) }
  }

  async function remove(): Promise<void> {
    if (!deleteTarget) return
    setSubmitting(true); setFormError(null)
    try {
      const response = await deleteSupplier(deleteTarget.id)
      setDeleteTarget(null); showToast(response.message)
      if (supplierList.suppliers.length === 1 && page > 1) setPage((value) => value - 1)
      else await refreshSuppliers()
    } catch (error) { setFormError(getUserFacingApiMessage(error)) }
    finally { setSubmitting(false) }
  }

  const editingSupplier = formDialog?.mode === 'edit' ? formDialog.supplier : undefined
  const formId = editingSupplier ? `edit-supplier-${editingSupplier.id}` : 'add-supplier'

  return (
    <section className="page supplier-page">
      <header className="page__header supplier-page__header">
        <div><h1 className="page__title">Supplier Management</h1><p className="page__description">Manage suppliers and their contact information.</p></div>
        <Button onClick={() => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'create' }) }} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add Supplier</Button>
      </header>

      <div className="supplier-page__search" role="search"><div className="supplier-page__search-input">
        <AppIcons.search size={iconSize} strokeWidth={iconStroke} aria-hidden="true" />
        <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search suppliers..." aria-label="Search suppliers" />
        {searchInput ? <button type="button" className="supplier-page__search-clear" aria-label="Clear supplier search" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}><AppIcons.close size={iconSize} strokeWidth={iconStroke} aria-hidden="true" /></button> : null}
      </div></div>

      {pageError ? <Alert tone="error" title="Suppliers could not be loaded">{pageError}<div className="supplier-page__retry"><Button variant="outline" onClick={() => void refreshSuppliers()}>Try Again</Button></div></Alert> : null}
      {loading ? <LoadingState label="Loading suppliers…" /> : <>
        <div className="supplier-page__summary">{supplierList.total} supplier{supplierList.total === 1 ? '' : 's'}</div>
        <SupplierTable suppliers={supplierList.suppliers} onEdit={(supplier) => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'edit', supplier }) }} onDelete={(supplier) => { setFormError(null); setDeleteTarget(supplier) }} />
        {supplierList.lastPage > 1 ? <nav className="supplier-page__pagination" aria-label="Supplier pages">
          <Button variant="outline" disabled={supplierList.currentPage <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
          <span>Page {supplierList.currentPage} of {supplierList.lastPage}</span>
          <Button variant="outline" disabled={supplierList.currentPage >= supplierList.lastPage} onClick={() => setPage((value) => value + 1)}>Next</Button>
        </nav> : null}
      </>}

      <Modal open={formDialog !== null} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'} onClose={closeForm} actions={<><Button variant="outline" onClick={closeForm} disabled={submitting}>Cancel</Button><Button type="submit" form={formId} disabled={submitting} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Saving…' : editingSupplier ? 'Save Changes' : 'Save Supplier'}</Button></>}>
        {formError ? <Alert tone="error" title="Supplier could not be saved">{formError}</Alert> : null}
        {formDialog ? <SupplierForm key={formId} formId={formId} supplier={editingSupplier} errors={fieldErrors} disabled={submitting} onSubmit={(input) => void save(input)} /> : null}
      </Modal>

      <Modal open={deleteTarget !== null} title="Delete Supplier?" onClose={() => { if (!submitting) { setDeleteTarget(null); setFormError(null) } }} actions={<><Button variant="outline" disabled={submitting} onClick={() => { setDeleteTarget(null); setFormError(null) }}>Cancel</Button><Button variant="danger" disabled={submitting} onClick={() => void remove()} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Deleting…' : 'Delete Supplier'}</Button></>}>
        {formError ? <Alert tone="error" title="Supplier could not be deleted">{formError}</Alert> : null}
        <div className="supplier-delete"><AppIcons.warning className="supplier-delete__icon" size={32} strokeWidth={iconStroke} aria-hidden="true" /><div><p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p><p>This action cannot be undone.</p></div></div>
      </Modal>
    </section>
  )
}
