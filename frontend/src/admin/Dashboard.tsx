import { Link } from 'react-router-dom'
import { trValue } from '../i18n'
import { useFetch } from '../site'
import type { Destination, Tour } from '../types'
import { missingLangs } from './ui'

export default function Dashboard() {
  const { data: tours } = useFetch<Tour[]>('/api/admin/tours')
  const { data: dests } = useFetch<Destination[]>('/api/admin/destinations')
  const { data: stats } = useFetch<{ nuevas: number }>('/api/admin/inquiries/stats')
  const pendingTr = tours?.filter((t) => missingLangs([t.title, t.summary, t.description, t.itinerary]).length > 0) ?? []
  const cards = [
    { n: tours?.filter((t) => t.isActive).length ?? '–', label: 'Tours publicados', to: '/admin/tours' },
    { n: dests?.length ?? '–', label: 'Destinos', to: '/admin/destinos' },
    { n: stats?.nuevas ?? '–', label: 'Consultas nuevas', to: '/admin/consultas' },
    { n: tours ? pendingTr.length : '–', label: 'Tours con traducción pendiente', to: '/admin/tours' },
  ]
  return (
    <>
      <h1>Resumen</h1>
      <div className="stats">
        {cards.map((c) => <Link key={c.label} to={c.to} className="stat card"><strong>{c.n}</strong><span>{c.label}</span></Link>)}
      </div>
      <div className="card">
        <h2>Accesos rápidos</h2>
        <div className="row-actions">
          <Link to="/admin/tours/nuevo" className="btn btn--primary">+ Nuevo tour</Link>
          <Link to="/admin/tours" className="btn">Actualizar precios</Link>
          <Link to="/admin/configuracion" className="btn">Portada e imágenes</Link>
          <Link to="/admin/faq" className="btn">Preguntas frecuentes</Link>
        </div>
      </div>
      {pendingTr.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Traducciones pendientes</h2>
          <ul className="pending-list">
            {pendingTr.slice(0, 10).map((t) => (
              <li key={t.id}><Link to={`/admin/tours/${t.id}`}>{trValue(t.title, 'es')}</Link> <span className="tr-miss">{missingLangs([t.title, t.summary, t.description, t.itinerary]).join(' · ').toUpperCase()}</span></li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
