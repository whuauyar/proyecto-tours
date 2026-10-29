import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api'
import type { Navigation, SiteSettings } from './types'

interface SiteCtx {
  site: SiteSettings | null
  nav: Navigation
  reload: () => void
}
const EMPTY_NAV: Navigation = { destinations: [], categories: [], pages: [] }
const Ctx = createContext<SiteCtx>({ site: null, nav: EMPTY_NAV, reload: () => {} })

export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteSettings | null>(null)
  const [nav, setNav] = useState<Navigation>(EMPTY_NAV)
  const load = () => {
    api<SiteSettings>('/api/settings').then(setSite).catch(() => {})
    api<Navigation>('/api/navigation').then(setNav).catch(() => {})
  }
  useEffect(load, [])
  useEffect(() => {
    if (!site) return
    // Colores de marca configurables desde el panel
    const root = document.documentElement.style
    if (site.primaryColor) root.setProperty('--primary', site.primaryColor)
    if (site.accentColor) root.setProperty('--accent', site.accentColor)
    // Icono de la pestaña: el configurado en el panel (o el logo)
    if (site.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.removeAttribute('type')
      link.href = site.faviconUrl
      let apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
      if (!apple) {
        apple = document.createElement('link')
        apple.rel = 'apple-touch-icon'
        document.head.appendChild(apple)
      }
      apple.href = site.faviconUrl
    }
  }, [site])
  return <Ctx.Provider value={{ site, nav, reload: load }}>{children}</Ctx.Provider>
}

export const useSite = () => useContext(Ctx)

/** Hook genérico de carga de datos */
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!path) return
    let alive = true
    setLoading(true)
    setError(null)
    api<T>(path)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [path])
  return { data, error, loading, setData }
}
