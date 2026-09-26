import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { EmptyState } from '../components/feedback/EmptyState'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Panel } from '../components/ui/Panel'
import { Select } from '../components/ui/Select'
import { Table } from '../components/ui/Table'
import { useAuth } from '../features/auth/AuthContext'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { getUserFacingApiMessage } from '../services/apiClient'
import { getHealth } from '../services/healthService'
import type { AppInfo } from '../types/electron-api'
import { roleLabel } from '../types/auth'
import type { HealthResponse } from '../types/health'
import '../components/layout/page.css'

type IpcStatus = 'loading' | 'connected' | 'failed'
type ApiStatus = 'loading' | 'connected' | 'failed'

type MockItem = {
  id: string
  code: string
  name: string
  price: string
}

const mockItems: MockItem[] = [
  { id: '1', code: 'ITM-001', name: 'Coca Cola', price: '₱20.00' },
  { id: '2', code: 'ITM-002', name: 'Royal', price: '₱20.00' },
  { id: '3', code: 'ITM-003', name: 'Bottled Water', price: '₱15.00' }
]

export function DashboardPage() {
  const { showToast } = useToast()
  const { currentUser } = useAuth()
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null)
  const [ipcStatus, setIpcStatus] = useState<IpcStatus>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [sampleName, setSampleName] = useState('')
  const [sampleStation, setSampleStation] = useState('main')

  const checkBackend = useCallback(async (signal?: AbortSignal): Promise<void> => {
    setApiStatus('loading')
    setApiErrorMessage(null)

    try {
      const response = await getHealth(signal)
      setHealth(response)
      setApiStatus('connected')
    } catch (error) {
      if (signal?.aborted) {
        return
      }

      setHealth(null)
      setApiStatus('failed')
      setApiErrorMessage(getUserFacingApiMessage(error))
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadAppInfo(): Promise<void> {
      if (!window.electronAPI?.getAppInfo) {
        if (!cancelled) {
          setIpcStatus('failed')
          setErrorMessage('electronAPI is not available')
        }
        return
      }

      try {
        const info = await window.electronAPI.getAppInfo()
        if (!cancelled) {
          setAppInfo(info)
          setIpcStatus('connected')
          setErrorMessage(null)
        }
      } catch (error) {
        if (!cancelled) {
          setIpcStatus('failed')
          setErrorMessage(
            error instanceof Error ? error.message : 'IPC request failed'
          )
        }
      }
    }

    void loadAppInfo()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void checkBackend(controller.signal)
    return () => {
      controller.abort()
    }
  }, [checkBackend])

  const platformLabel =
    appInfo?.platform === 'win32' ? 'Windows' : (appInfo?.platform ?? '—')

  return (
    <div className="page page__stack">
      <header className="page__header">
        <h1 className="page__title">Dashboard</h1>
        <p className="page__description">
          Signed in as {currentUser?.name ?? '—'} ({currentUser ? roleLabel(currentUser.role) : '—'}
          ). Business modules remain placeholders until later phases.
        </p>
      </header>

      <div className="page__grid-2">
        <Panel title="Current User">
          <dl className="electron-status__list">
            <div className="electron-status__row">
              <dt>Name</dt>
              <dd>{currentUser?.name ?? '—'}</dd>
            </div>
            <div className="electron-status__row">
              <dt>Email</dt>
              <dd>{currentUser?.email ?? '—'}</dd>
            </div>
            <div className="electron-status__row">
              <dt>Role</dt>
              <dd>
                {currentUser ? (
                  <Badge tone="accent">{roleLabel(currentUser.role)}</Badge>
                ) : (
                  '—'
                )}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Electron Status">
          <dl className="electron-status__list">
            <div className="electron-status__row">
              <dt>Application</dt>
              <dd>{appInfo?.name ?? '—'}</dd>
            </div>
            <div className="electron-status__row">
              <dt>Version</dt>
              <dd>{appInfo?.version ?? '—'}</dd>
            </div>
            <div className="electron-status__row">
              <dt>Platform</dt>
              <dd>{platformLabel}</dd>
            </div>
            <div className="electron-status__row">
              <dt>IPC</dt>
              <dd>
                {ipcStatus === 'loading' && 'Checking…'}
                {ipcStatus === 'connected' && (
                  <Badge tone="success">Connected</Badge>
                )}
                {ipcStatus === 'failed' && (
                  <Badge tone="error">
                    Failed{errorMessage ? `: ${errorMessage}` : ''}
                  </Badge>
                )}
              </dd>
            </div>
          </dl>
        </Panel>
      </div>

      <div className="page__grid-2">
        <Panel title="Backend Status">
          <dl className="electron-status__list">
            <div className="electron-status__row">
              <dt>Backend Status</dt>
              <dd>
                {apiStatus === 'loading' && 'Checking backend…'}
                {apiStatus === 'connected' && (
                  <Badge tone="success">Connected</Badge>
                )}
                {apiStatus === 'failed' && (
                  <Badge tone="error">Unable to connect</Badge>
                )}
              </dd>
            </div>
            <div className="electron-status__row">
              <dt>Application</dt>
              <dd>
                {apiStatus === 'loading' && '—'}
                {apiStatus === 'connected' && (health?.application ?? '—')}
                {apiStatus === 'failed' && (apiErrorMessage ?? 'Unable to connect')}
              </dd>
            </div>
            <div className="electron-status__row">
              <dt>API</dt>
              <dd>
                <Button
                  variant="outline"
                  onClick={() => {
                    void checkBackend()
                  }}
                  disabled={apiStatus === 'loading'}
                >
                  Retry
                </Button>
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel title="Alerts">
          <div className="page__stack" style={{ gap: '12px' }}>
            <Alert tone="success" title="Success">
              Changes saved (preview).
            </Alert>
            <Alert tone="info" title="Information">
              Phase 8 authentication is active.
            </Alert>
          </div>
        </Panel>
      </div>

      <Panel title="UI Foundation Preview">
        <div className="page__stack">
          <div className="page__row">
            <Button
              variant="primary"
              icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}
              onClick={() => showToast('Saved successfully (preview)')}
            >
              Add Item
            </Button>
            <Button variant="secondary">POS Action</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button
              variant="danger"
              icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}
              onClick={() => setModalOpen(true)}
            >
              Delete
            </Button>
            <Badge tone="accent">Preview</Badge>
            <LoadingState label="Loading sample…" />
          </div>

          <div className="page__grid-2">
            <div className="page__field">
              <Label htmlFor="sample-name">Item name</Label>
              <Input
                id="sample-name"
                value={sampleName}
                onChange={(event) => setSampleName(event.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div className="page__field">
              <Label htmlFor="sample-station">Station</Label>
              <Select
                id="sample-station"
                value={sampleStation}
                onChange={(event) => setSampleStation(event.target.value)}
                options={[
                  { value: 'main', label: 'Main Station' },
                  { value: 'canteen', label: 'Canteen' }
                ]}
              />
            </div>
          </div>

          <Table
            rows={mockItems}
            rowKey={(row) => row.id}
            columns={[
              { key: 'code', header: 'Item Code', render: (row) => row.code },
              { key: 'name', header: 'Description', render: (row) => row.name },
              {
                key: 'price',
                header: 'Price',
                align: 'right',
                render: (row) => row.price
              },
              {
                key: 'actions',
                header: 'Actions',
                align: 'right',
                render: () => (
                  <Button
                    variant="ghost"
                    aria-label="Edit sample row"
                    icon={
                      <AppIcons.edit size={iconSize} strokeWidth={iconStroke} />
                    }
                  >
                    Edit
                  </Button>
                )
              }
            ]}
          />

          <EmptyState
            icon={AppIcons.items}
            title="No consignments yet"
            description="Empty states stay compact. Real data arrives after backend modules."
            action={
              <Button variant="outline" onClick={() => showToast('Action preview', 'info')}>
                Refresh
              </Button>
            }
          />
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        title="Confirm delete"
        onClose={() => setModalOpen(false)}
        actions={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setModalOpen(false)
                showToast('Delete preview acknowledged')
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          This is a foundation modal preview. No records are deleted.
        </p>
      </Modal>
    </div>
  )
}
