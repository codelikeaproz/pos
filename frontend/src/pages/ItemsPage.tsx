import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ItemForm, type ItemFieldErrors } from '../features/items/ItemForm'
import { ItemTable } from '../features/items/ItemTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createItem, deleteItem, loadItems, updateItem } from '../services/itemService'
import type { Item, ItemInput, ItemList } from '../types/item'
import './items-page.css'

type FormDialog = { mode: 'create' } | { mode: 'edit'; item: Item }
const EMPTY_LIST: ItemList = { items: [], currentPage: 1, lastPage: 1, total: 0 }

function fieldErrorsFrom(error: unknown): ItemFieldErrors {
  if (!(error instanceof ApiError)) return {}
  return { item_code: error.errors.item_code?.[0], name: error.errors.name?.[0], description: error.errors.description?.[0], quantity: error.errors.quantity?.[0], unit: error.errors.unit?.[0], price: error.errors.price?.[0] }
}

export function ItemsPage() {
  const { showToast } = useToast()
  const [itemList, setItemList] = useState<ItemList>(EMPTY_LIST)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formDialog, setFormDialog] = useState<FormDialog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ItemFieldErrors>({})

  const refreshItems = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setPageError(null)
    try { setItemList(await loadItems(search, page, signal)) }
    catch (error) { if (!signal?.aborted) setPageError(getUserFacingApiMessage(error)) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [page, search])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { setPage(1); setSearch(searchInput.trim()) }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    void refreshItems(controller.signal)
    return () => controller.abort()
  }, [refreshItems])

  function closeForm(): void {
    if (!submitting) { setFormDialog(null); setFieldErrors({}); setFormError(null) }
  }

  async function save(input: ItemInput): Promise<void> {
    if (!formDialog) return
    setSubmitting(true); setFieldErrors({}); setFormError(null)
    try {
      const response = formDialog.mode === 'create' ? await createItem(input) : await updateItem(formDialog.item.id, input)
      setFormDialog(null); showToast(response.message); await refreshItems()
    } catch (error) { setFieldErrors(fieldErrorsFrom(error)); setFormError(getUserFacingApiMessage(error)) }
    finally { setSubmitting(false) }
  }

  async function remove(): Promise<void> {
    if (!deleteTarget) return
    setSubmitting(true); setFormError(null)
    try {
      const response = await deleteItem(deleteTarget.id)
      setDeleteTarget(null); showToast(response.message)
      if (itemList.items.length === 1 && page > 1) setPage((value) => value - 1)
      else await refreshItems()
    } catch (error) { setFormError(getUserFacingApiMessage(error)) }
    finally { setSubmitting(false) }
  }

  const editingItem = formDialog?.mode === 'edit' ? formDialog.item : undefined
  const formId = editingItem ? `edit-item-${editingItem.id}` : 'add-item'

  return (
    <section className="page item-page">
      <header className="page__header item-page__header">
        <div><h1 className="page__title">Item Management</h1><p className="page__description">Manage product and food definitions and selling prices.</p></div>
        <Button onClick={() => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'create' }) }} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add Item</Button>
      </header>

      <div className="item-page__search" role="search"><div className="item-page__search-input">
        <AppIcons.search size={iconSize} strokeWidth={iconStroke} aria-hidden="true" />
        <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by item code, name, or description..." aria-label="Search items" />
        {searchInput ? <button type="button" className="item-page__search-clear" aria-label="Clear item search" onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}><AppIcons.close size={iconSize} strokeWidth={iconStroke} aria-hidden="true" /></button> : null}
      </div></div>

      {pageError ? <Alert tone="error" title="Items could not be loaded">{pageError}<div className="item-page__retry"><Button variant="outline" onClick={() => void refreshItems()}>Try Again</Button></div></Alert> : null}
      {loading ? <LoadingState label="Loading items…" /> : <>
        <div className="item-page__summary">{itemList.total} item{itemList.total === 1 ? '' : 's'}</div>
        <ItemTable items={itemList.items} onEdit={(item) => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'edit', item }) }} onDelete={(item) => { setFormError(null); setDeleteTarget(item) }} />
        {itemList.lastPage > 1 ? <nav className="item-page__pagination" aria-label="Item pages"><Button variant="outline" disabled={itemList.currentPage <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><span>Page {itemList.currentPage} of {itemList.lastPage}</span><Button variant="outline" disabled={itemList.currentPage >= itemList.lastPage} onClick={() => setPage((value) => value + 1)}>Next</Button></nav> : null}
      </>}

      <Modal open={formDialog !== null} title={editingItem ? 'Edit Item' : 'Add Item'} onClose={closeForm} actions={<><Button variant="outline" onClick={closeForm} disabled={submitting}>Cancel</Button><Button type="submit" form={formId} disabled={submitting} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Saving…' : editingItem ? 'Save Changes' : 'Save Item'}</Button></>}>
        {formError ? <Alert tone="error" title="Item could not be saved">{formError}</Alert> : null}
        {formDialog ? <ItemForm key={formId} formId={formId} item={editingItem} errors={fieldErrors} disabled={submitting} onSubmit={(input) => void save(input)} /> : null}
      </Modal>

      <Modal open={deleteTarget !== null} title="Delete Item?" onClose={() => { if (!submitting) { setDeleteTarget(null); setFormError(null) } }} actions={<><Button variant="outline" disabled={submitting} onClick={() => { setDeleteTarget(null); setFormError(null) }}>Cancel</Button><Button variant="danger" disabled={submitting} onClick={() => void remove()} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Deleting…' : 'Delete Item'}</Button></>}>
        {formError ? <Alert tone="error" title="Item could not be deleted">{formError}</Alert> : null}
        <div className="item-delete"><AppIcons.warning className="item-delete__icon" size={24} strokeWidth={iconStroke} aria-hidden="true" /><div><p>Are you sure you want to delete <strong>“{deleteTarget?.name}”</strong>?</p><p>This action cannot be undone.</p></div></div>
      </Modal>
    </section>
  )
}
