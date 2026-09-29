import { useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from './auth'

export default function AdminLayout() {
  const { user, ready, logout } = useAuth()
  const [nuevas, setNuevas] = useState(0)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  useEffect(() => {
    setOpen(false)
    if (user) api<{ nuevas: number }>('/api/admin/inquiries/stats').then((r) => setNuevas(r.nuevas)).catch(() => {})
  }, [user, loc.pathname])

  if (!ready) return <div className="admin-loading">Cargando…</div>
  if (!user) return <Navigate to="/admin/login" replace />

  return (
    <div className="admin">
      <aside className={`admin__side ${open ? 'is-open' : ''}`}>
        <div className="admin__brand">▲ Panel</div>
        <nav>
          <NavLink to="/admin" end>Resumen</NavLink>
          <NavLink to="/admin/tours">Tours y precios</NavLink>
          <NavLink to="/admin/destinos">Destinos</NavLink>
          <NavLink to="/admin/tipos">Tipos de experiencia</NavLink>
          <NavLink to="/admin/faq">Preguntas frecuentes</NavLink>
          <NavLink to="/admin/paginas">Páginas "Info útil"</NavLink>
          <NavLink to="/admin/consultas">Consultas {nuevas > 0 && <span className="pill">{nuevas}</span>}</NavLink>
          <NavLink to="/admin/configuracion">Configuración del sitio</NavLink>
          <NavLink to="/admin/cuenta">Mi cuenta</NavLink>
        </nav>
        <a className="admin__site-link" href="/" target="_blank" rel="noreferrer">Ver sitio web ↗</a>
      </aside>
      <div className="admin__main">
        <header className="admin__top">
          <button className="menu-toggle admin__menu" onClick={() => setOpen(!open)} aria-label="Menú">☰</button>
          <span className="muted">{user.email}</span>
          <button className="btn btn--sm" onClick={logout}>Cerrar sesión</button>
        </header>
        <div className="admin__content"><Outlet /></div>
      </div>
    </div>
  )
}
