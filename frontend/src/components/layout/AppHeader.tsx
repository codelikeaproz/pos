import logo from '../../assets/cmuhomestaylogo.png'
import { useAuth } from '../../features/auth/AuthContext'
import { SidebarProfileMenu } from './SidebarProfileMenu'
import './app-header.css'

export function AppHeader() {
  const { currentUser, logout, updateProfile } = useAuth()

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <img className="app-header__logo" src={logo} alt="CMU HomeStay" />
        <p className="app-header__app-name">University HomeStay POS</p>
      </div>
      {currentUser ? <SidebarProfileMenu user={currentUser} logout={logout} updateProfile={updateProfile} /> : null}
    </header>
  )
}
