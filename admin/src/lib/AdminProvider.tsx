import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

type Permissions = {
  canEdit: boolean
  canDisable: boolean
  canAddReservations: boolean
  canAddGuests: boolean
  canViewDownload: boolean
}

type Admin = {
  _id?: string
  id?: string
  username?: string
  name?: string
  role?: 'superadmin' | 'admin' | 'staff' | string
  permissions?: Partial<Permissions>
}

type AdminContextValue = {
  admin: Admin | null
  isAuthenticated: boolean
  loading: boolean
  permissions: Permissions
  refresh: () => Promise<void>
  logout: () => void
}

const defaultPermissions: Permissions = {
  canEdit: false,
  canDisable: false,
  canAddReservations: false,
  canAddGuests: false,
  // Backend default is true, preserve that expectation for unauthenticated too
  canViewDownload: true,
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined)

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  const fetchMe = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setAdmin(null)
        return
      }
      const res = await fetch('/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        // invalid token or server error; clear auth state but don't hard redirect
        setAdmin(null)
        return
      }
      const data = await res.json()
      setAdmin(data?.admin || null)
    } catch (err) {
      // network or parsing error; keep user logged out gracefully
      setAdmin(null)
    } finally {
      if (isMountedRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchMe()

    // Listen for cross-tab changes and custom auth change events
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin_token') fetchMe()
    }
    const onAuthChanged = () => fetchMe()
    const onFocus = () => {
      // Refresh on tab focus to pick up any external auth changes
      fetchMe()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('admin-auth-changed', onAuthChanged as EventListener)
    window.addEventListener('focus', onFocus)
    return () => {
      isMountedRef.current = false
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('admin-auth-changed', onAuthChanged as EventListener)
      window.removeEventListener('focus', onFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const permissions = useMemo<Permissions>(() => {
    if (!admin) return defaultPermissions
    if (admin.role === 'superadmin') {
      return { canEdit: true, canDisable: true, canAddReservations: true, canAddGuests: true, canViewDownload: true }
    }
    return {
      canEdit: !!admin.permissions?.canEdit,
      canDisable: !!admin.permissions?.canDisable,
      canAddReservations: !!admin.permissions?.canAddReservations,
      canAddGuests: !!admin.permissions?.canAddGuests,
      // default true matches backend model default
      canViewDownload: admin.permissions?.canViewDownload !== false,
    }
  }, [admin])

  const logout = () => {
    try {
      localStorage.removeItem('admin_token')
    } finally {
      setAdmin(null)
      // Let listeners know auth changed (same-tab consumers can react)
      window.dispatchEvent(new Event('admin-auth-changed'))
    }
  }

  const value: AdminContextValue = {
    admin,
    isAuthenticated: !!admin,
    loading,
    permissions,
    refresh: fetchMe,
    logout,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}

export const usePermissions = () => useAdmin().permissions
