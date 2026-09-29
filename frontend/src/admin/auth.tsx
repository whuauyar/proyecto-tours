import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, tokenStore } from '../api'

interface User { id: number; email: string; fullName: string | null }
interface AuthCtx {
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
const Ctx = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('admin:logout', onLogout)
    if (tokenStore.get()) {
      api<User>('/api/admin/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setReady(true))
    } else setReady(true)
    return () => window.removeEventListener('admin:logout', onLogout)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api<{ token: string; user: User }>('/api/auth/login', { method: 'POST', json: { email, password } })
    tokenStore.set(res.token)
    setUser(res.user)
  }
  const logout = async () => {
    await api('/api/admin/auth/logout', { method: 'POST' }).catch(() => {})
    tokenStore.set(null)
    setUser(null)
  }
  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
