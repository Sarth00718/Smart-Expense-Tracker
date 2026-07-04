import { useState, useEffect } from 'react'
import { User, Lock, Edit2, Save, X, Camera, Eye, EyeOff, Monitor, Smartphone, Sun, Moon, Palette, Settings2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useTheme } from '../../../context/ThemeContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Badge, Separator, Tabs, TabsList, TabsTrigger, TabsContent, PageHeader, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../ui'
import BiometricSettings from './BiometricSettings'
import { usersService } from '../../../services/usersService'
import toast from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui'

const Settings = () => {
  const { user, setUser } = useAuth()
  const { theme, isDark, toggleTheme, setLightMode, setDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  const [sessions, setSessions] = useState([])
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '', email: user?.email || '', picture: user?.picture || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  const handleEditToggle = () => {
    if (isEditing) {
      setProfileForm({ fullName: user?.fullName || '', email: user?.email || '', picture: user?.picture || '' })
    }
    setIsEditing(!isEditing)
  }

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) { toast.error('Full name is required'); return }
    if (!profileForm.email.trim()) { toast.error('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email)) { toast.error('Invalid email format'); return }
    setLoading(true)
    try {
      const response = await usersService.updateProfile({
        fullName: profileForm.fullName.trim(), email: profileForm.email.trim(), picture: profileForm.picture
      })
      const updatedUser = response.data.user
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally { setLoading(false) }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { toast.error('Image size should be less than 2MB'); return }
      const reader = new FileReader()
      reader.onloadend = () => setProfileForm({ ...profileForm, picture: reader.result })
      reader.readAsDataURL(file)
    }
  }

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error('All password fields are required'); return }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return }
    if (currentPassword === newPassword) { toast.error('New password must be different from current password'); return }
    setLoading(true)
    try {
      await usersService.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password')
    } finally { setLoading(false) }
  }

  const fetchSessions = async () => {
    try {
      const response = await usersService.getSessions()
      setSessions(response.data.sessions || [])
    } catch (error) {
      toast.error('Failed to load sessions')
    }
  }

  const handleRevokeSession = async (sessionId) => {
    try {
      await usersService.revokeSession(sessionId)
      toast.success('Session revoked successfully')
      fetchSessions()
    } catch { toast.error('Failed to revoke session') }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader icon={Settings2} gradient="from-slate-500 to-gray-600" title="Settings" subtitle="Manage your account and preferences" />

      <Tabs>
        <TabsList className="gap-4">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} activeTab={activeTab} onClick={setActiveTab}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" activeTab={activeTab}>
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" icon={Edit2} onClick={handleEditToggle}>Edit Profile</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" icon={Save} onClick={handleSaveProfile} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
                    <Button variant="outline" size="sm" icon={X} onClick={handleEditToggle} disabled={loading}>Cancel</Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 pb-6 border-b border-border">
                  <div className="relative shrink-0">
                    <Avatar className="w-24 h-24">
                      {profileForm.picture ? (
                        <AvatarImage src={profileForm.picture} alt="Profile" />
                      ) : (
                        <AvatarFallback className="text-2xl">{(user?.fullName || 'U')[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-110">
                        <Camera className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-1">{user?.fullName || 'User'}</h4>
                    <p className="text-sm text-muted-foreground mb-2 break-all">{user?.email}</p>
                    {isEditing && <p className="text-xs text-muted-foreground">Click the camera icon to upload a new profile picture (max 2MB)</p>}
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Full Name</label>
                    <Input value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} readOnly={!isEditing} className={!isEditing ? 'bg-muted/50' : ''} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Email Address</label>
                    <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} readOnly={!isEditing} className={!isEditing ? 'bg-muted/50' : ''} placeholder="Enter your email" />
                    {isEditing && <p className="text-xs text-muted-foreground mt-2">Changing your email will require verification</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">Account Type</label>
                    <Input value="Email Account" readOnly className="bg-muted/50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/10">
              <CardContent className="p-6">
                <h4 className="font-semibold text-foreground mb-4">Account Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Member Since</p>
                    <p className="text-lg font-semibold text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Last Login</p>
                    <p className="text-lg font-semibold text-foreground">{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose how Smart Expense Tracker looks to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button onClick={setLightMode} className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${!isDark ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-muted-foreground/30'}`}>
                  {!isDark && <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  <div className="w-full h-24 bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm">
                    <div className="h-6 bg-white border-b border-gray-200 flex items-center px-2 gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-gray-300 rounded-full" />)}
                    </div>
                    <div className="flex h-[4.5rem]">
                      <div className="w-8 bg-gray-50 border-r border-gray-200 flex flex-col gap-1 p-1">
                        {[1,2,3].map(i => <div key={i} className="h-2 bg-gray-200 rounded" />)}
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-1">
                        {[1,2].map(i => <div key={i} className="h-2 bg-gray-100 rounded" />)}
                        <div className="h-4 bg-blue-100 rounded w-2/3 mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2"><Sun className="w-4 h-4 text-amber-500" /><span className="font-semibold text-sm text-foreground">Light Mode</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Classic bright interface</p>
                </button>
                <button onClick={setDarkMode} className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${isDark ? 'border-primary bg-primary/10 shadow-md' : 'border-border hover:border-muted-foreground/30'}`}>
                  {isDark && <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  <div className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg mb-3 overflow-hidden shadow-sm">
                    <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-600 rounded-full" />)}
                    </div>
                    <div className="flex h-[4.5rem]">
                      <div className="w-8 bg-slate-800 border-r border-slate-700 flex flex-col gap-1 p-1">
                        {[1,2,3].map(i => <div key={i} className="h-2 bg-slate-600 rounded" />)}
                      </div>
                      <div className="flex-1 p-2 flex flex-col gap-1">
                        {[1,2].map(i => <div key={i} className="h-2 bg-slate-700 rounded" />)}
                        <div className="h-4 bg-primary/30 rounded w-2/3 mt-1" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2"><Moon className="w-4 h-4 text-slate-400" /><span className="font-semibold text-sm text-foreground">Dark Mode</span></div>
                  <p className="text-xs text-muted-foreground mt-1">Easy on the eyes at night</p>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-indigo-600 flex items-center justify-center shadow">
                    {isDark ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Quick Toggle</p>
                    <p className="text-xs text-muted-foreground">Currently: <span className="font-medium text-primary">{isDark ? 'Dark Mode' : 'Light Mode'}</span></p>
                  </div>
                </div>
                <button onClick={toggleTheme} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring/20 ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`} role="switch" aria-checked={isDark}>
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" activeTab={activeTab}>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Lock className="w-7 h-7 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Password</h3>
                        <p className="text-sm text-muted-foreground">Last changed: {user?.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleDateString() : 'Never'}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">Change your password regularly to keep your account secure.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
                </div>
              </CardContent>
            </Card>

            <BiometricSettings />

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Monitor className="w-7 h-7 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Active Sessions</h3>
                        <p className="text-sm text-muted-foreground">{sessions.length || 1} active session{(sessions.length !== 1) ? 's' : ''}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">Manage and monitor your active sessions across different devices.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setShowSessionsModal(true); fetchSessions() }}>View Sessions</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showPasswordModal} onClose={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }} size="sm">
        <DialogHeader onClose={() => setShowPasswordModal(false)}>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          {['currentPassword', 'newPassword', 'confirmPassword'].map(field => {
            const labels = { currentPassword: 'Current Password', newPassword: 'New Password', confirmPassword: 'Confirm New Password' }
            const placeholders = { currentPassword: 'Enter current password', newPassword: 'Enter new password (min 6 chars)', confirmPassword: 'Confirm new password' }
            return (
              <div key={field}>
                <label className="block text-sm font-medium text-foreground/80 mb-2">{labels[field]}</label>
                <div className="relative">
                  <input type={showPasswords[field.replace('Password', '').toLowerCase()] || (field === 'currentPassword' ? showPasswords.current : field === 'newPassword' ? showPasswords.new : showPasswords.confirm) ? 'text' : 'password'}
                    value={passwordForm[field]} onChange={(e) => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    placeholder={placeholders[field]} />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, [field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm']: !showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPasswords[field === 'currentPassword' ? 'current' : field === 'newPassword' ? 'new' : 'confirm'] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )
          })}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }} disabled={loading}>Cancel</Button>
          <Button variant="default" onClick={handleChangePassword} disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showSessionsModal} onClose={() => setShowSessionsModal(false)} size="md">
        <DialogHeader onClose={() => setShowSessionsModal(false)}>
          <DialogTitle>Active Sessions</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active sessions found</p>
          ) : sessions.map((session) => (
            <div key={session.id} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    {session.device?.includes('Mobile') ? <Smartphone className="w-5 h-5 text-blue-500" /> : <Monitor className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{session.device} {session.current && <Badge variant="success" className="ml-2">Current</Badge>}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{session.browser}</p>
                    <p className="text-xs text-muted-foreground mt-1">IP: {session.ip} • Last active: {new Date(session.lastActive).toLocaleString()}</p>
                  </div>
                </div>
                {!session.current && <Button variant="destructive" size="sm" onClick={() => handleRevokeSession(session.id)}>Revoke</Button>}
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Settings
