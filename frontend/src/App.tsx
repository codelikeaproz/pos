import { createHashRouter, RouterProvider } from 'react-router-dom'
import { ToastProvider } from './components/feedback/Toast'
import { AuthProvider } from './features/auth/AuthContext'
import { appRoutes } from './routes'

const router = createHashRouter(appRoutes)

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  )
}
