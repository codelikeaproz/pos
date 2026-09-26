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
import { clearAuthToken, getAuthToken } from '../../services/authToken'
import type { AuthStatus, CurrentUser } from '../../types/auth'

type AuthContextValue = {
  status: AuthStatus
  currentUser: CurrentUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  bootstrapError: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getAuthToken() ? 'authenticating' : 'unauthenticated'
  )
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)

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
      } catch {
        if (!controller.signal.aborted) {
          clearAuthToken()
          setCurrentUser(null)
          setStatus('unauthenticated')
          setBootstrapError(null)
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
    try {
      await logoutRequest()
    } catch {
      clearAuthToken()
    } finally {
      setCurrentUser(null)
      setStatus('unauthenticated')
    }
  }, [])

  const value = useMemo(
    () => ({
      status,
      currentUser,
      login,
      logout,
      bootstrapError
    }),
    [status, currentUser, login, logout, bootstrapError]
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
