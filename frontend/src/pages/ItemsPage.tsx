import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { SearchField } from '../components/ui/SearchField'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { ItemForm, type ItemFieldErrors } from '../features/items/ItemForm'
import { ItemTable } from '../features/items/ItemTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createItem, loadItems, updateItem } from '../services/itemService'
import type { Item, ItemInput, ItemList } from '../types/item'
import './items-page.css'

type FormDialog = { mode: 'create' } | { mode: 'edit'; item: Item }
const EMPTY_LIST: ItemList = { items: [], currentPage: 1, lastPage: 1, total: 0 }

function fieldErrorsFrom(error: unknown): ItemFieldErrors {
  if (!(error instanceof ApiError)) return {}
  return { item_code: error.errors.item_code?.[0], name: error.errors.name?.[0], units_backup: error.errors.units_backup?.[0], unit: error.errors.unit?.[0], reorder_point: error.errors.reorder_point?.[0], price: error.errors.price?.[0] }
}

export function ItemsPage() {
  const { showToast } = useToast()
  const [itemList, setItemList] = useState<ItemList>(EMPTY_LIST)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formDialog, setFormDialog] = useState<FormDialog | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Item | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<ItemFieldErrors>({})

  const refreshItems = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setPageError(null)
    try { setItemList(await loadItems(search, page, pageSize, signal)) }
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

  async function changeStatus(item: Item, isActive: boolean): Promise<void> {
    setSubmitting(true); setFormError(null)
    try {
      const response = await updateItem(item.id, { ...item, price: undefined, is_active: isActive })
      setDeactivateTarget(null); showToast(response.message); await refreshItems()
    } catch (error) { setFormError(getUserFacingApiMessage(error)) }
    finally { setSubmitting(false) }
  }

  const editingItem = formDialog?.mode === 'edit' ? formDialog.item : undefined
  const formId = editingItem ? `edit-item-${editingItem.id}` : 'add-item'

  return (
    <section className="page item-page">
      <header className="page__header item-page__header">
        <div><h1 className="page__title">Product Management</h1><p className="page__description">Manage product and food definitions. Change selling prices in Price.</p></div>
        <Button onClick={() => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'create' }) }} icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}>Add Item</Button>
      </header>

      <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search by item code, item name, or unit name..." label="Search items" />

      {pageError ? <Alert tone="error" title="Items could not be loaded">{pageError}<div className="item-page__retry"><Button variant="outline" onClick={() => void refreshItems()}>Try Again</Button></div></Alert> : null}
      {loading ? <LoadingState label="Loading items…" /> : <>
        <div className="item-page__summary">{itemList.total} item{itemList.total === 1 ? '' : 's'}</div>
        <ItemTable items={itemList.items} onEdit={(item) => { setFieldErrors({}); setFormError(null); setFormDialog({ mode: 'edit', item }) }} onDeactivate={(item) => { setFormError(null); setDeactivateTarget(item) }} onActivate={(item) => void changeStatus(item, true)} />
        <Pagination currentPage={itemList.currentPage} lastPage={itemList.lastPage} label="Item" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} />
      </>}

      <Modal open={formDialog !== null} title={editingItem ? 'Edit Item' : 'Add Item'} onClose={closeForm} actions={<Button type="submit" form={formId} disabled={submitting} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{submitting ? 'Saving…' : editingItem ? 'Save Changes' : 'Save Item'}</Button>}>
        {formError ? <Alert tone="error" title="Item could not be saved">{formError}</Alert> : null}
        {formDialog ? <ItemForm key={formId} formId={formId} item={editingItem} errors={fieldErrors} disabled={submitting} onSubmit={(input) => void save(input)} /> : null}
      </Modal>

      <Modal open={deactivateTarget !== null} title="Deactivate Item?" onClose={() => { if (!submitting) { setDeactivateTarget(null); setFormError(null) } }} actions={<Button variant="danger" disabled={submitting} onClick={() => deactivateTarget && void changeStatus(deactivateTarget, false)}>Deactivate Item</Button>}>
        {formError ? <Alert tone="error">{formError}</Alert> : null}
        <p>Deactivate <strong>{deactivateTarget?.name}</strong>? It will no longer appear in POS for new sales. Its station stock and sales history will remain.</p>
      </Modal>
    </section>
  )
}
