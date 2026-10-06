import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { SearchField } from '../components/ui/SearchField'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { ConsigneeForm, type ConsigneeFieldErrors } from '../features/consignees/ConsigneeForm'
import { ConsigneeTable } from '../features/consignees/ConsigneeTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createConsignee, deleteConsignee, loadConsignees, updateConsignee } from '../services/consigneeService'
import type { Consignee, ConsigneeInput, ConsigneeList } from '../types/consignee'
import './consignees-page.css'

type FormDialog = { mode: 'create' } | { mode: 'edit'; consignee: Consignee }
const EMPTY_LIST: ConsigneeList = { consignees: [], currentPage: 1, lastPage: 1, total: 0 }

function fieldErrorsFrom(error: unknown): ConsigneeFieldErrors {
  if (!(error instanceof ApiError)) return {}
  return { name: error.errors.name?.[0], contact_number: error.errors.contact_number?.[0], email: error.errors.email?.[0], address: error.errors.address?.[0] }
}

export function ConsigneesPage() {
  const { showToast } = useToast()
  const [list, setList] = useState<ConsigneeList>(EMPTY_LIST)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formDialog, setFormDialog] = useState<FormDialog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Consignee | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ConsigneeFieldErrors>({})

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setPageError(null)
    try { setList(await loadConsignees(search, page, pageSize, signal)) }
    catch (error) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(error)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [page, search])

  useEffect(() => { const id = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(id) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  function closeForm() { if (!submitting) { setFormDialog(null); setFieldErrors({}); setFormError(null) } }
  async function save(input: ConsigneeInput) {
    if (!formDialog) return
    setSubmitting(true); setFieldErrors({}); setFormError(null)
    try { const response = formDialog.mode === 'create' ? await createConsignee(input) : await updateConsignee(formDialog.consignee.id, input); setFormDialog(null); showToast(response.message); await refresh() }
    catch (error) { setFieldErrors(fieldErrorsFrom(error)); setFormError(getUserFacingApiMessage(error)) }
    finally { setSubmitting(false) }
  }
  async function remove() {
    if (!deleteTarget) return
    setSubmitting(true); setFormError(null)
    try { const response = await deleteConsignee(deleteTarget.id); setDeleteTarget(null); showToast(response.message); if (list.consignees.length === 1 && page > 1) setPage((value) => value - 1); else await refresh() }
    catch (error) { setFormError(getUserFacingApiMessage(error)) }
    finally { setSubmitting(false) }
  }

  const editing = formDialog?.mode === 'edit' ? formDialog.consignee : undefined
  const formId = editing ? `edit-consignee-${editing.id}` : 'add-consignee'

  return (
    <section className="page consignee-page">
      <header className="page__header consignee-page__header"><div><h1 className="page__title">Consignee Management</h1><p className="page__description">Manage consignee contact information for future consignment workflows.</p></div><Button onClick={() => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'create' }) }} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add Consignee</Button></header>
      <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search consignees..." label="Search consignees" />
      {pageError ? <Alert tone="error" title="Consignees could not be loaded">{pageError}<div className="consignee-page__retry"><Button variant="outline" onClick={() => void refresh()}>Try Again</Button></div></Alert> : null}
      {loading ? <LoadingState label="Loading consignees…" /> : <><div className="consignee-page__summary">{list.total} consignee{list.total === 1 ? '' : 's'}</div><ConsigneeTable consignees={list.consignees} onEdit={(consignee) => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'edit', consignee }) }} onDelete={(consignee) => { setFormError(null); setDeleteTarget(consignee) }} /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Consignee" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} /></>}
      <Modal open={formDialog !== null} title={editing ? 'Edit Consignee' : 'Add Consignee'} onClose={closeForm} actions={<Button type="submit" form={formId} disabled={submitting} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Saving…' : editing ? 'Save Changes' : 'Save Consignee'}</Button>}>
        {formError ? <Alert tone="error" title="Consignee could not be saved">{formError}</Alert> : null}{formDialog ? <ConsigneeForm key={formId} formId={formId} consignee={editing} errors={fieldErrors} disabled={submitting} onSubmit={(input) => void save(input)} /> : null}
      </Modal>
      <Modal open={deleteTarget !== null} title="Delete Consignee?" onClose={() => { if (!submitting) { setDeleteTarget(null); setFormError(null) } }} actions={<Button variant="danger" disabled={submitting} onClick={() => void remove()} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Deleting…' : 'Delete Consignee'}</Button>}>
        {formError ? <Alert tone="error" title="Consignee could not be deleted">{formError}</Alert> : null}<div className="consignee-delete"><AppIcons.warning className="consignee-delete__icon" size={24} strokeWidth={iconStroke} /><div><p>Are you sure you want to delete <strong>“{deleteTarget?.name}”</strong>?</p><p>This action cannot be undone.</p></div></div>
      </Modal>
    </section>
  )
}
