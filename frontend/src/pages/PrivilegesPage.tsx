import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { Table, type TableColumn } from '../components/ui/Table'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createPrivilege, loadPrivileges, updatePrivilege } from '../services/privilegeService'
import type { Privilege, PrivilegeList } from '../types/privilege'
import './privileges-page.css'

const EMPTY: PrivilegeList = { privileges: [], currentPage: 1, lastPage: 1, total: 0 }

export function PrivilegesPage() {
  const { showToast } = useToast()
  const [list, setList] = useState(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Privilege | null | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setPageError(null)
    try { setList(await loadPrivileges(search, page, pageSize, signal)) }
    catch (error) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(error)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [search, page, pageSize])

  useEffect(() => { const id = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(id) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  function openForm(privilege: Privilege | null): void { setEditing(privilege); setDescription(privilege?.description ?? ''); setFormError(null) }
  function closeForm(): void { if (!submitting) setEditing(undefined) }
  async function save(event: FormEvent): Promise<void> {
    event.preventDefault(); setSubmitting(true); setFormError(null)
    try {
      const result = editing ? await updatePrivilege(editing.id, description.trim()) : await createPrivilege(description.trim())
      setEditing(undefined); showToast(result.message); await refresh()
    } catch (error) {
      setFormError(error instanceof ApiError ? error.errors.description?.[0] ?? getUserFacingApiMessage(error) : getUserFacingApiMessage(error))
    } finally { setSubmitting(false) }
  }

  const columns: TableColumn<Privilege>[] = [
    { key: 'description', header: 'Description', render: row => row.description },
    { key: 'action', header: 'Action', align: 'right', render: row => <Button className="table-icon-action" variant="outline" aria-label={`Edit ${row.description}`} title={`Edit ${row.description}`} onClick={() => openForm(row)} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />} /> }
  ]

  return <section className="page privileges-page">
    <header className="page__header"><div><h1 className="page__title">Privilege</h1><p className="page__description">Manage business classifications assigned to Users.</p></div><Button onClick={() => openForm(null)} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add Privilege</Button></header>
    <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search Privileges..." label="Search Privileges" />
    {pageError ? <Alert tone="error" title="Privileges could not be loaded">{pageError}</Alert> : null}
    {loading ? <LoadingState label="Loading Privileges…" /> : <><p className="page__description">{list.total} Privilege{list.total === 1 ? '' : 's'}</p><Table columns={columns} rows={list.privileges} rowKey={row => String(row.id)} emptyMessage="No Privileges found." /><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="Privilege" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} /></>}
    <Modal open={editing !== undefined} title={editing ? 'Edit Privilege' : 'Add Privilege'} onClose={closeForm} initialFocusRef={inputRef} actions={<Button type="submit" form="privilege-form" disabled={submitting} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Saving…' : 'Save'}</Button>}>
      <form id="privilege-form" className="privilege-form" onSubmit={event => void save(event)}><Label htmlFor="privilege-description" required>Description</Label><Input ref={inputRef} id="privilege-description" value={description} onChange={event => setDescription(event.target.value)} maxLength={100} required disabled={submitting} error={Boolean(formError)} />{formError ? <span className="page__field-error">{formError}</span> : null}</form>
    </Modal>
  </section>
}
