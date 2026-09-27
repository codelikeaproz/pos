import { useCallback, useEffect, useState } from 'react'
import { Alert } from '../components/feedback/Alert'
import { LoadingState } from '../components/feedback/LoadingState'
import { Modal } from '../components/feedback/Modal'
import { useToast } from '../components/feedback/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import {
  EmployeeForm,
  type EmployeeFieldErrors
} from '../features/employees/EmployeeForm'
import { EmployeeTable } from '../features/employees/EmployeeTable'
import { useAuth } from '../features/auth/AuthContext'
import { AppIcons, iconSize, iconStroke } from '../lib/icons'
import { ApiError, getUserFacingApiMessage } from '../services/apiClient'
import {
  createEmployee,
  deleteEmployee,
  loadEmployees,
  loadEmployeeOptions,
  updateEmployee
} from '../services/userService'
import type { Employee, EmployeeInput, EmployeeList, EmployeeOptions } from '../types/user'
import './employees-page.css'

type FormDialog = { mode: 'create' } | { mode: 'edit'; employee: Employee }

const EMPTY_LIST: EmployeeList = {
  employees: [],
  currentPage: 1,
  lastPage: 1,
  total: 0
}
const EMPTY_OPTIONS: EmployeeOptions = { stations: [] }

function fieldErrorsFrom(error: unknown): EmployeeFieldErrors {
  if (!(error instanceof ApiError)) {
    return {}
  }

  return {
    name: error.errors.name?.[0],
    email: error.errors.email?.[0],
    password: error.errors.password?.[0],
    role: error.errors.role?.[0],
    station_id: error.errors.station_id?.[0]
  }
}

export function EmployeesPage() {
  const { currentUser } = useAuth()
  const { showToast } = useToast()
  const [employeeList, setEmployeeList] = useState<EmployeeList>(EMPTY_LIST)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [formDialog, setFormDialog] = useState<FormDialog | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<EmployeeFieldErrors>({})
  const [options, setOptions] = useState<EmployeeOptions>(EMPTY_OPTIONS)

  useEffect(() => {
    loadEmployeeOptions().then(setOptions).catch((error) => setPageError(getUserFacingApiMessage(error)))
  }, [])

  const refreshEmployees = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true)
      setPageError(null)

      try {
        const result = await loadEmployees(search, page, signal)
        setEmployeeList(result)
      } catch (error) {
        if (!signal?.aborted) {
          setPageError(getUserFacingApiMessage(error))
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [page, search]
  )

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPage(1)
      setSearch(searchInput.trim())
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    const controller = new AbortController()
    void refreshEmployees(controller.signal)
    return () => controller.abort()
  }, [refreshEmployees])

  function openCreateDialog(): void {
    setFieldErrors({})
    setFormError(null)
    setFormDialog({ mode: 'create' })
  }

  function openEditDialog(employee: Employee): void {
    setFieldErrors({})
    setFormError(null)
    setFormDialog({ mode: 'edit', employee })
  }

  function closeFormDialog(): void {
    if (!submitting) {
      setFormDialog(null)
      setFieldErrors({})
      setFormError(null)
    }
  }

  async function handleSave(input: EmployeeInput): Promise<void> {
    if (!formDialog) {
      return
    }

    setSubmitting(true)
    setFieldErrors({})
    setFormError(null)

    try {
      const response =
        formDialog.mode === 'create'
          ? await createEmployee(input)
          : await updateEmployee(formDialog.employee.id, input)

      setFormDialog(null)
      showToast(response.message)
      await refreshEmployees()
    } catch (error) {
      setFieldErrors(fieldErrorsFrom(error))
      setFormError(getUserFacingApiMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteTarget) {
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const response = await deleteEmployee(deleteTarget.id)
      setDeleteTarget(null)
      showToast(response.message)
      if (employeeList.employees.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        await refreshEmployees()
      }
    } catch (error) {
      setFormError(getUserFacingApiMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const editingEmployee =
    formDialog?.mode === 'edit' ? formDialog.employee : undefined
  const formId = editingEmployee ? `edit-employee-${editingEmployee.id}` : 'add-employee'

  return (
    <section className="page employee-page">
      <header className="page__header employee-page__header">
        <div>
          <h1 className="page__title">Employee Management</h1>
          <p className="page__description">
            Manage the administrators and end users who can access the POS.
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          icon={<AppIcons.add size={iconSize} strokeWidth={iconStroke} />}
        >
          Add Employee
        </Button>
      </header>

      <div className="employee-page__search" role="search">
        <div className="employee-page__search-input">
          <AppIcons.search
            size={iconSize}
            strokeWidth={iconStroke}
            aria-hidden="true"
          />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search employees by name or email..."
            aria-label="Search employees by name or email"
          />
          {searchInput ? (
            <button
              type="button"
              className="employee-page__search-clear"
              aria-label="Clear employee search"
              onClick={() => {
                setSearchInput('')
                setSearch('')
                setPage(1)
              }}
            >
              <AppIcons.close
                size={iconSize}
                strokeWidth={iconStroke}
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>
      </div>

      {pageError ? (
        <Alert tone="error" title="Employees could not be loaded">
          {pageError}
          <div className="employee-page__retry">
            <Button variant="outline" onClick={() => void refreshEmployees()}>
              Try Again
            </Button>
          </div>
        </Alert>
      ) : null}

      {loading ? (
        <LoadingState label="Loading employees…" />
      ) : (
        <>
          <div className="employee-page__summary">
            {employeeList.total} employee{employeeList.total === 1 ? '' : 's'}
          </div>
          <EmployeeTable
            employees={employeeList.employees}
            currentUserId={currentUser?.id ?? 0}
            onEdit={openEditDialog}
            onDelete={(employee) => {
              setFormError(null)
              setDeleteTarget(employee)
            }}
          />
          {employeeList.lastPage > 1 ? (
            <nav className="employee-page__pagination" aria-label="Employee pages">
              <Button
                variant="outline"
                disabled={employeeList.currentPage <= 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
              >
                Previous
              </Button>
              <span>
                Page {employeeList.currentPage} of {employeeList.lastPage}
              </span>
              <Button
                variant="outline"
                disabled={employeeList.currentPage >= employeeList.lastPage}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </Button>
            </nav>
          ) : null}
        </>
      )}

      <Modal
        open={formDialog !== null}
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        onClose={closeFormDialog}
        actions={
          <>
            <Button variant="outline" onClick={closeFormDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={submitting}
              icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}
            >
              {submitting ? 'Saving…' : 'Save Employee'}
            </Button>
          </>
        }
      >
        {formError ? (
          <Alert tone="error" title="Employee could not be saved">
            {formError}
          </Alert>
        ) : null}
        {formDialog ? (
          <EmployeeForm
            key={formId}
            formId={formId}
            employee={editingEmployee}
            errors={fieldErrors}
            disabled={submitting}
            options={options}
            onSubmit={(input) => void handleSave(input)}
          />
        ) : null}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="Delete Employee?"
        onClose={() => {
          if (!submitting) {
            setDeleteTarget(null)
            setFormError(null)
          }
        }}
        actions={
          <>
            <Button
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setDeleteTarget(null)
                setFormError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={submitting}
              onClick={() => void handleDelete()}
              icon={<AppIcons.delete size={iconSize} strokeWidth={iconStroke} />}
            >
              {submitting ? 'Deleting…' : 'Delete Employee'}
            </Button>
          </>
        }
      >
        {formError ? (
          <Alert tone="error" title="Employee could not be deleted">
            {formError}
          </Alert>
        ) : null}
        <div className="employee-delete">
          <AppIcons.warning
            className="employee-delete__icon"
            size={32}
            strokeWidth={iconStroke}
            aria-hidden="true"
          />
          <div>
            <p>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            </p>
            <p>This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </section>
  )
}
