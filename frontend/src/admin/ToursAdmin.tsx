import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useFetch } from '../site'
import type { Category, Destination, Tour } from '../types'
import { trValue } from '../i18n'
import { MissingBadges, useToast } from './ui'

function PriceCell({ tour, field, onSaved }: { tour: Tour; field: 'price' | 'offerPrice' | 'childPrice'; onSaved: (t: Tour) => void }) {
  const initial = tour[field] ?? ''
  const [val, setVal] = useState(String(initial))
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const dirty = val !== String(initial)
  const save = async () => {
    if (!dirty) return
    if (field === 'price' && val === '') return setVal(String(initial))
    setSaving(true)
    try {
      const updated = await api<Tour>(`/api/admin/tours/${tour.id}/quick`, {
        method: 'PATCH',
        json: { [field]: val === '' ? null : Number(val) },
      })
      onSaved({ ...tour, ...updated, category: tour.category, destination: tour.destination })
      toast(`Precio actualizado: ${trValue(tour.title, 'es')}`)
    } catch (e) {
      toast((e as Error).message, 'error')
      setVal(String(initial))
    } finally {
      setSaving(false)
    }
  }
  return (
    <input
      className={`price-input ${dirty ? 'is-dirty' : ''}`}
      type="number" min={0} step="0.01" value={val} disabled={saving}
      placeholder={field !== 'price' ? '—' : ''}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      aria-label={field}
    />
  )
}

export default function ToursAdmin() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [dest, setDest] = useState('')
  const qs = new URLSearchParams()
  if (q) qs.set('q', q)
  if (cat) qs.set('category', cat)
  if (dest) qs.set('destination', dest)
  const { data: tours, setData, loading } = useFetch<Tour[]>(`/api/admin/tours?${qs}`)
  const { data: cats } = useFetch<Category[]>('/api/admin/categories')
  const { data: dests } = useFetch<Destination[]>('/api/admin/destinations')
  const toast = useToast()

  const replace = (t: Tour) => setData((list) => list?.map((x) => (x.id === t.id ? t : x)) ?? null)
  const toggle = async (tour: Tour, field: 'isActive' | 'isFeatured') => {
    const updated = await api<Tour>(`/api/admin/tours/${tour.id}/quick`, { method: 'PATCH', json: { [field]: !tour[field] } })
    replace({ ...tour, ...updated, category: tour.category, destination: tour.destination })
  }
  const remove = async (tour: Tour) => {
    if (!window.confirm(`¿Eliminar "${trValue(tour.title, 'es')}"? También se borrarán sus imágenes.`)) return
    await api(`/api/admin/tours/${tour.id}`, { method: 'DELETE' })
    setData((list) => list?.filter((x) => x.id !== tour.id) ?? null)
    toast('Tour eliminado')
  }

  return (
    <>
      <div className="admin-head">
        <h1>Tours y precios</h1>
        <Link to="/admin/tours/nuevo" className="btn btn--primary">+ Nuevo tour</Link>
      </div>
      <p className="muted">Edita los precios (adulto, oferta y niño) directamente en la tabla: se guarda al salir del campo o al presionar Enter. Deja la oferta vacía para quitarla.</p>
      <div className="filters">
        <input placeholder="Buscar por nombre…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={dest} onChange={(e) => setDest(e.target.value)}>
          <option value="">Todos los destinos</option>
          {dests?.map((d) => <option key={d.id} value={d.id}>{trValue(d.name, 'es')}</option>)}
        </select>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Todos los tipos</option>
          {cats?.map((c) => <option key={c.id} value={c.id}>{trValue(c.name, 'es')}</option>)}
        </select>
      </div>
      <div className="table-wrap card">
        <table className="table">
          <thead>
            <tr><th></th><th>Tour</th><th>Adulto</th><th>Oferta</th><th>Niño</th><th>Mon.</th><th>Publicado</th><th>Portada</th><th></th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="muted">Cargando…</td></tr>}
            {tours?.map((t) => (
              <tr key={t.id} className={t.isActive ? '' : 'is-muted'}>
                <td>{t.coverUrl ? <img className="thumb" src={t.coverUrl} alt="" /> : <div className="thumb img-fallback" />}</td>
                <td data-label="Tour">
                  <Link to={`/admin/tours/${t.id}`} className="strong">{trValue(t.title, 'es')}</Link>
                  <div className="muted small">{trValue(t.destination?.name, 'es') ?? 'Sin destino'} · {trValue(t.category?.name, 'es') ?? 'Sin tipo'} · {t.durationDays} día(s)</div>
                  <MissingBadges values={[t.title, t.summary, t.description, t.itinerary]} />
                </td>
                <td data-label="Precio"><PriceCell key={`p${t.id}${t.price}`} tour={t} field="price" onSaved={replace} /></td>
                <td data-label="Oferta"><PriceCell key={`o${t.id}${t.offerPrice}`} tour={t} field="offerPrice" onSaved={replace} /></td>
                <td data-label="Niño"><PriceCell key={`c${t.id}${t.childPrice}`} tour={t} field="childPrice" onSaved={replace} /></td>
                <td data-label="Moneda">{t.currency}</td>
                <td data-label="Publicado"><input type="checkbox" className="switch" checked={t.isActive} onChange={() => toggle(t, 'isActive')} /></td>
                <td data-label="Portada"><input type="checkbox" className="switch" checked={t.isFeatured} onChange={() => toggle(t, 'isFeatured')} /></td>
                <td className="nowrap">
                  <Link to={`/admin/tours/${t.id}`} className="btn btn--sm">Editar</Link>{' '}
                  <button className="btn btn--sm btn--danger-ghost" onClick={() => remove(t)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {!loading && tours?.length === 0 && <tr><td colSpan={9} className="muted">Sin resultados</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
