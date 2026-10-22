import { FormEvent, useEffect, useRef, useState } from 'react'
import femaleProfile from '../../assets/femaleprofile.png'
import maleProfile from '../../assets/maleprofile.png'
import type { CurrentUser, ProfileInput, UserSex } from '../../types/auth'
import { roleLabel } from '../../types/auth'
import { AppIcons, iconSize, iconStroke } from '../../lib/icons'
import { Badge } from '../ui/Badge'
import { Modal } from '../feedback/Modal'
import { Alert } from '../feedback/Alert'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Select } from '../ui/Select'
import { ApiError, getUserFacingApiMessage } from '../../services/apiClient'

type SidebarProfileMenuProps = {
  user: CurrentUser
  logout: () => Promise<void>
  updateProfile: (input: ProfileInput) => Promise<void>
}

export function SidebarProfileMenu({ user, logout, updateProfile }: SidebarProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [sex, setSex] = useState<UserSex>(user.sex)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const avatar = user.sex === 'female' ? femaleProfile : maleProfile

  useEffect(() => {
    if (!open) return

    function closeOnOutsideClick(event: MouseEvent): void {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.stopImmediatePropagation()
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape, true)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [open])

  async function handleLogout(): Promise<void> {
    setOpen(false)
    setLoggingOut(true)
    try { await logout() } finally { setLoggingOut(false) }
  }

  function startEditing(): void {
    setName(user.name)
    setEmail(user.email)
    setSex(user.sex)
    setPassword('')
    setPasswordConfirmation('')
    setSettingsError(null)
    setFieldErrors({})
    setEditingProfile(true)
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setSaving(true)
    setSettingsError(null)
    setFieldErrors({})
    try {
      const input: ProfileInput = { name: name.trim(), email: email.trim(), sex }
      if (password) {
        input.password = password
        input.password_confirmation = passwordConfirmation
      }
      await updateProfile(input)
      setEditingProfile(false)
    } catch (error) {
      if (error instanceof ApiError) setFieldErrors(error.errors)
      setSettingsError(getUserFacingApiMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return <>
    <div className="app-sidebar__profile" ref={containerRef}>
      <button className="app-sidebar__profile-trigger" type="button" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <img className="app-sidebar__avatar" src={avatar} alt="" />
        <span className="app-sidebar__profile-copy"><strong>{user.name}</strong><small>{roleLabel(user.role)}</small></span>
        <AppIcons.chevronDown className={open ? 'is-open' : ''} size={18} strokeWidth={iconStroke} aria-hidden="true" />
      </button>
      {open ? <div className="app-sidebar__profile-menu" role="menu">
        <div className="app-sidebar__profile-summary"><img className="app-sidebar__avatar" src={avatar} alt="" /><span><strong>{user.name}</strong><small>{user.email}</small></span></div>
        <dl className="app-sidebar__profile-meta">
          <div><dt>System Role</dt><dd>{roleLabel(user.role)}</dd></div>
          <div><dt>Privileges</dt><dd className="app-sidebar__privileges">{user.privileges.length ? user.privileges.map((privilege) => <Badge key={privilege.id}>{privilege.description}</Badge>) : 'None'}</dd></div>
          <div><dt>Station</dt><dd>{user.station?.name ?? '—'}</dd></div>
        </dl>
        <div className="app-sidebar__profile-actions">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); setEditingProfile(false); setProfileOpen(true) }}><AppIcons.profile size={iconSize} strokeWidth={iconStroke} />My Profile</button>
          <button type="button" role="menuitem" className="app-sidebar__profile-logout" disabled={loggingOut} onClick={() => void handleLogout()}><AppIcons.logout size={iconSize} strokeWidth={iconStroke} />{loggingOut ? 'Signing out…' : 'Logout'}</button>
        </div>
      </div> : null}
    </div>
    <Modal open={profileOpen} title="My Profile" onClose={() => { if (!saving) { setProfileOpen(false); setEditingProfile(false) } }} actions={editingProfile ? <Button type="submit" form="profile-edit-form" disabled={saving} icon={<AppIcons.save size={iconSize} strokeWidth={iconStroke} />}>{saving ? 'Saving…' : 'Save Changes'}</Button> : undefined}>
      {editingProfile ? <form id="profile-edit-form" className="app-sidebar__settings-form" onSubmit={(event) => void saveProfile(event)}>
        {settingsError ? <Alert tone="error" title="Unable to save profile">{settingsError}</Alert> : null}
        <div><Label htmlFor="profile-name" required>Name</Label><Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={255} required disabled={saving} error={Boolean(fieldErrors.name)} />{fieldErrors.name ? <span className="page__field-error">{fieldErrors.name[0]}</span> : null}</div>
        <div><Label htmlFor="profile-email" required>Email</Label><Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={255} required disabled={saving} error={Boolean(fieldErrors.email)} />{fieldErrors.email ? <span className="page__field-error">{fieldErrors.email[0]}</span> : null}</div>
        <div><Label htmlFor="profile-sex" required>Sex</Label><Select id="profile-sex" value={sex} onChange={(event) => setSex(event.target.value as UserSex)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} required disabled={saving} error={Boolean(fieldErrors.sex)} />{fieldErrors.sex ? <span className="page__field-error">{fieldErrors.sex[0]}</span> : null}</div>
        <div><Label htmlFor="profile-password">New Password</Label><Input id="profile-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} autoComplete="new-password" disabled={saving} error={Boolean(fieldErrors.password)} />{fieldErrors.password ? <span className="page__field-error">{fieldErrors.password[0]}</span> : <span className="app-sidebar__settings-help">Leave blank to keep your current password.</span>}</div>
        <div><Label htmlFor="profile-password-confirmation">Confirm New Password</Label><Input id="profile-password-confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} minLength={8} autoComplete="new-password" disabled={saving || !password} required={Boolean(password)} /></div>
        <p className="app-sidebar__settings-note">System Role, Privileges, and Station are managed by an Administrator.</p>
      </form> : <div className="app-sidebar__profile-details">
        <div className="app-sidebar__profile-identity">
          <img className="app-sidebar__profile-details-avatar" src={avatar} alt="" />
          <div><strong>{user.name}</strong><span>{user.email}</span></div>
          <Button className="app-sidebar__profile-edit" variant="outline" aria-label="Edit profile" title="Edit profile" onClick={startEditing} icon={<AppIcons.edit size={iconSize} strokeWidth={iconStroke} />} />
        </div>
        <dl><div><dt>Sex</dt><dd>{user.sex === 'female' ? 'Female' : 'Male'}</dd></div><div><dt>System Role</dt><dd>{roleLabel(user.role)}</dd></div><div><dt>Privileges</dt><dd>{user.privileges.length ? user.privileges.map((privilege) => privilege.description).join(', ') : 'None'}</dd></div><div><dt>Station</dt><dd>{user.station?.name ?? '—'}</dd></div></dl>
      </div>}
    </Modal>
  </>
}
