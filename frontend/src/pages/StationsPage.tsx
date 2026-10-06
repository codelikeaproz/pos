import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { SearchField } from '../components/ui/SearchField'
import { Pagination, type AdminPageSize } from '../components/ui/Pagination'
import { StationForm, type StationFieldErrors } from '../features/stations/StationForm'
import { StationTable } from '../features/stations/StationTable'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import { createStation, deleteStation, loadStations, updateStation } from '../services/stationService'
import type { Station, StationInput, StationList } from '../types/station'
import './stations-page.css'

type FormDialog = { mode: 'create' } | { mode: 'edit'; station: Station }
const EMPTY_LIST: StationList = { stations: [], currentPage: 1, lastPage: 1, total: 0 }

function fieldErrorsFrom(error: unknown): StationFieldErrors {
  if (!(error instanceof ApiError)) return {}
  return {
    name: error.errors.name?.[0],
    location: error.errors.location?.[0],
    description: error.errors.description?.[0]
  }
}

export function StationsPage() {
  const { showToast } = useToast()
  const [stationList, setStationList] = useState<StationList>(EMPTY_LIST)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<AdminPageSize>(10)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formDialog, setFormDialog] = useState<FormDialog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Station | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<StationFieldErrors>({})

  const refreshStations = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setPageError(null)
    try {
      setStationList(await loadStations(search, page, pageSize, signal))
    } catch (error) {
      if (!signal?.aborted) setPageError(getUserFacingApiMessage(error))
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    void refreshStations(controller.signal)
    return () => controller.abort()
  }, [refreshStations])

  function closeFormDialog(): void {
    if (!submitting) {
      setFormDialog(null)
      setFieldErrors({})
      setFormError(null)
    }
  }

  async function handleSave(input: StationInput): Promise<void> {
    if (!formDialog) return
    setSubmitting(true)
    setFieldErrors({})
    setFormError(null)
    try {
      const response = formDialog.mode === 'create'
        ? await createStation(input)
        : await updateStation(formDialog.station.id, input)
      setFormDialog(null)
      showToast(response.message)
      await refreshStations()
    } catch (error) {
      setFieldErrors(fieldErrorsFrom(error))
      setFormError(getUserFacingApiMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteTarget) return
    setSubmitting(true)
    setFormError(null)
    try {
      const response = await deleteStation(deleteTarget.id)
      setDeleteTarget(null)
      showToast(response.message)
      if (stationList.stations.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        await refreshStations()
      }
    } catch (error) {
      setFormError(getUserFacingApiMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const editingStation = formDialog?.mode === 'edit' ? formDialog.station : undefined
  const formId = editingStation ? `edit-station-${editingStation.id}` : 'add-station'

  return (
    <section className="page station-page">
      <header className="page__header station-page__header">
        <div>
          <h1 className="page__title">Stations</h1>
          <p className="page__description">Manage POS locations and business stations.</p>
        </div>
        <Button
          onClick={() => {
            setFieldErrors({})
            setFormError(null)
            setFormDialog({ mode: 'create' })
          }}
          icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}
        >
          Add Station
        </Button>
      </header>

      <SearchField value={searchInput} onChange={setSearchInput} onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }} placeholder="Search stations by name, location, or description..." label="Search stations by name, location, or description" />

      {pageError ? (
        <Alert tone="error" title="Stations could not be loaded">
          {pageError}
          <div className="station-page__retry">
            <Button variant="outline" onClick={() => void refreshStations()}>Try Again</Button>
          </div>
        </Alert>
      ) : null}

      {loading ? <LoadingState label="Loading stations…" /> : (
        <>
          <div className="station-page__summary">
            {stationList.total} station{stationList.total === 1 ? '' : 's'}
          </div>
          <StationTable
            stations={stationList.stations}
            onEdit={(station) => {
              setFieldErrors({})
              setFormError(null)
              setFormDialog({ mode: 'edit', station })
            }}
            onDelete={(station) => { setFormError(null); setDeleteTarget(station) }}
          />
          <Pagination currentPage={stationList.currentPage} lastPage={stationList.lastPage} label="Station" onPageChange={setPage} pageSize={pageSize} onPageSizeChange={(value) => { setPageSize(value); setPage(1) }} />
        </>
      )}

      <Modal
        open={formDialog !== null}
        title={editingStation ? 'Edit Station' : 'Add Station'}
        onClose={closeFormDialog}
        actions={<Button type="submit" form={formId} disabled={submitting} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>
            {submitting ? 'Saving…' : editingStation ? 'Save Changes' : 'Save Station'}
          </Button>}
      >
        {formError ? <Alert tone="error" title="Station could not be saved">{formError}</Alert> : null}
        {formDialog ? <StationForm key={formId} formId={formId} station={editingStation} errors={fieldErrors} disabled={submitting} onSubmit={(input) => void handleSave(input)} /> : null}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Delete Station?"
        onClose={() => { if (!submitting) { setDeleteTarget(null); setFormError(null) } }}
        actions={<Button variant="danger" disabled={submitting} onClick={() => void handleDelete()} icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}>
            {submitting ? 'Deleting…' : 'Delete Station'}
          </Button>}
      >
        {formError ? <Alert tone="error" title="Station could not be deleted">{formError}</Alert> : null}
        <div className="station-delete">
          <AppIcons.warning className="station-delete__icon" size={32} strokeWidth={iconStroke} aria-hidden="true" />
          <div>
            <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
            <p>This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </section>
  )
}
