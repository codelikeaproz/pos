import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'
import { SearchField } from '../components/ui/SearchField'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { getUserFacingApiMessage } from '../services/apiClient'
import { loadPrivilegeAssignments, savePrivilegeAssignments } from '../services/privilegeService'
import { roleLabel } from '../types/auth'
import { useAuth } from '../features/auth/AuthContext'
import type { AssignmentUser, PrivilegeAssignmentList } from '../types/privilege'
import './privilege-assignments-page.css'

const EMPTY: PrivilegeAssignmentList = { users: [], privileges: [], currentPage: 1, lastPage: 1, total: 0 }

export function PrivilegeAssignmentsPage() {
  const { showToast } = useToast()
  const { currentUser, refreshCurrentUser } = useAuth()
  const [list, setList] = useState(EMPTY)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AssignmentUser | null>(null)
  const [checked, setChecked] = useState<number[]>([])
  const [pendingSelection, setPendingSelection] = useState<AssignmentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dirty = useMemo(() => selected ? [...checked].sort().join(',') !== [...selected.privilegeIds].sort().join(',') : false, [checked, selected])

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError(null)
    try { setList(await loadPrivilegeAssignments(search, page, signal)) }
    catch (reason) { if (!signal?.aborted) setError(getUserFacingApiMessage(reason)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [search, page])
  useEffect(() => { const id = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350); return () => window.clearTimeout(id) }, [searchInput])
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort() }, [refresh])

  function selectUser(user: AssignmentUser): void {
    if (dirty && selected?.id !== user.id) { setPendingSelection(user); return }
    setSelected(user); setChecked(user.privilegeIds)
  }
  async function save(): Promise<void> {
    if (!selected) return
    setSaving(true); setError(null)
    try { const result = await savePrivilegeAssignments(selected.id, checked); setSelected({ ...selected, privilegeIds: checked }); showToast(result.message); if (currentUser?.id === selected.id) await refreshCurrentUser(); await refresh() }
    catch (reason) { setError(getUserFacingApiMessage(reason)) }
    finally { setSaving(false) }
  }

  return <section className="page privilege-assignment-page">
    <header className="page__header"><div><h1 className="page__title">Privilege Assignment</h1><p className="page__description">Assign one or more business classifications to an existing User.</p></div></header>
    <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search Users..." label="Search Users" />
    {error ? <Alert tone="error">{error}</Alert> : null}
    {loading ? <LoadingState label="Loading assignments…" /> : <div className="privilege-assignment__grid">
      <section><h2>Users</h2><div className="privilege-assignment__user-head" aria-hidden="true"><span>Select</span><span>Name</span><span>Email</span><span>System Role</span></div><div className="privilege-assignment__users">{list.users.map(user => <label key={user.id} className={selected?.id === user.id ? 'is-selected' : ''}><input type="radio" name="assignment-user" checked={selected?.id === user.id} onChange={() => selectUser(user)} aria-label={`Select ${user.name}`} /><span>{user.name}</span><span>{user.email}</span><span className="privilege-assignment__role">{roleLabel(user.role)}</span></label>)}{list.users.length === 0 ? <p>No Users found.</p> : null}</div><Pagination currentPage={list.currentPage} lastPage={list.lastPage} label="User" onPageChange={next => { if (!dirty) setPage(next); else setError('Save or discard the current changes before changing pages.') }} /></section>
      <section className="privilege-assignment__privileges"><h2>Available Privileges</h2>{selected ? <><p className="privilege-assignment__selected-user">Assignments for <strong>{selected.name}</strong></p>{list.privileges.map(privilege => <label key={privilege.id}><input type="checkbox" checked={checked.includes(privilege.id)} onChange={event => setChecked(current => event.target.checked ? [...current, privilege.id] : current.filter(id => id !== privilege.id))} />{privilege.description}</label>)}<Button onClick={() => void save()} disabled={!dirty || saving} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{saving ? 'Saving…' : 'Save Assignments'}</Button></> : <p>Select a User to manage assignments.</p>}</section>
    </div>}
    <Modal open={pendingSelection !== null} title="Discard unsaved changes?" onClose={() => setPendingSelection(null)} actions={<><Button variant="outline" onClick={() => setPendingSelection(null)}>Keep Editing</Button><Button onClick={() => { if (pendingSelection) { setSelected(pendingSelection); setChecked(pendingSelection.privilegeIds) } setPendingSelection(null) }}>Discard Changes</Button></>}><p>The current User's Privilege changes have not been saved.</p></Modal>
  </section>
}
