import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  extractLoginErrorMessage,
  fetchCurrentUser,
  login as loginRequest,
  logout as logoutRequest
} from '../../services/authService'
import { ApiError } from '../../services/apiClient'
import {
  AUTH_SESSION_INVALIDATED_EVENT,
  clearAuthToken,
  getAuthToken,
  type AuthSessionInvalidatedDetail
} from '../../services/authToken'
import type { AlertTone } from '../../components/feedback/Alert'
import type { AuthStatus, CurrentUser } from '../../types/auth'

type AuthNotice = {
  tone: AlertTone
  title: string
  message: string
}

type AuthContextValue = {
  status: AuthStatus
  currentUser: CurrentUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
  bootstrapError: string | null
  authNotice: AuthNotice | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getAuthToken() ? 'authenticating' : 'unauthenticated'
  )
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [authNotice, setAuthNotice] = useState<AuthNotice | null>(null)

  useEffect(() => {
    const handleSessionInvalidated = (event: Event): void => {
      const detail = (event as CustomEvent<AuthSessionInvalidatedDetail>).detail

      setCurrentUser(null)
      setStatus('unauthenticated')
      setAuthNotice({
        tone: 'warning',
        title: 'Session ended',
        message:
          detail?.message ??
          'Your session is no longer valid. Please sign in again.'
      })
    }

    window.addEventListener(
      AUTH_SESSION_INVALIDATED_EVENT,
      handleSessionInvalidated
    )

    return () => {
      window.removeEventListener(
        AUTH_SESSION_INVALIDATED_EVENT,
        handleSessionInvalidated
      )
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function bootstrap(): Promise<void> {
      const token = getAuthToken()
      if (!token) {
        setStatus('unauthenticated')
        setCurrentUser(null)
        return
      }

      try {
        const user = await fetchCurrentUser(controller.signal)
        if (!controller.signal.aborted) {
          setCurrentUser(user)
          setStatus('authenticated')
          setBootstrapError(null)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setCurrentUser(null)
          setStatus('unauthenticated')

          if (
            error instanceof ApiError &&
            (error.kind === 'network' || error.kind === 'timeout')
          ) {
            setBootstrapError('Unable to connect to the server.')
            setAuthNotice({
              tone: 'warning',
              title: 'Server unavailable',
              message:
                'Your saved session could not be checked. Restore the server connection and try again.'
            })
          } else if (!(error instanceof ApiError && error.status === 401)) {
            clearAuthToken()
            setBootstrapError(null)
            setAuthNotice({
              tone: 'warning',
              title: 'Session ended',
              message: 'Your saved session could not be restored. Please sign in again.'
            })
          }
        }
      }
    }

    void bootstrap()
    return () => {
      controller.abort()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setStatus('authenticating')
    setBootstrapError(null)
    setAuthNotice(null)

    try {
      const result = await loginRequest(email, password)
      setCurrentUser(result.user)
      setStatus('authenticated')
    } catch (error) {
      clearAuthToken()
      setCurrentUser(null)
      setStatus('unauthenticated')
      throw new Error(extractLoginErrorMessage(error))
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthNotice(null)

    try {
      await logoutRequest()
    } catch {
      clearAuthToken()
      setAuthNotice({
        tone: 'warning',
        title: 'Signed out locally',
        message:
          'The server could not confirm logout. You have still been signed out on this device.'
      })
    } finally {
      setCurrentUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    const user = await fetchCurrentUser()
    setCurrentUser(user)
  }, [])

  const value = useMemo(
    () => ({
      status,
      currentUser,
      login,
      logout,
      refreshCurrentUser,
      bootstrapError,
      authNotice
    }),
    [status, currentUser, login, logout, refreshCurrentUser, bootstrapError, authNotice]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
