import { useState } from 'react'
import { api } from '../api'
import { useFetch } from '../site'
import type { Inquiry } from '../types'
import { waLink } from '../components/common'
import { LANG_META, trValue } from '../i18n'
import { useToast } from './ui'

interface Page { data: Inquiry[]; meta: { total: number; currentPage: number; lastPage: number } }

export default function InquiriesAdmin() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const { data, setData } = useFetch<Page>(`/api/admin/inquiries?page=${page}${status ? `&status=${status}` : ''}`)
  const toast = useToast()

  const update = async (i: Inquiry, s: Inquiry['status']) => {
    await api(`/api/admin/inquiries/${i.id}`, { method: 'PATCH', json: { status: s } })
    setData((d) => d && { ...d, data: d.data.map((x) => (x.id === i.id ? { ...x, status: s } : x)) })
    toast('Estado actualizado')
  }
  const remove = async (i: Inquiry) => {
    if (!window.confirm('¿Eliminar esta consulta?')) return
    await api(`/api/admin/inquiries/${i.id}`, { method: 'DELETE' })
    setData((d) => d && { ...d, data: d.data.filter((x) => x.id !== i.id) })
  }

  return (
    <>
      <div className="admin-head">
        <h1>Consultas recibidas</h1>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">Todas</option><option value="nuevo">Nuevas</option><option value="atendido">Atendidas</option><option value="cerrado">Cerradas</option>
        </select>
      </div>
      <div className="inquiries">
        {data?.data.map((i) => (
          <div key={i.id} className={`card inquiry inquiry--${i.status}`}>
            <div className="inquiry__head">
              <div>
                <strong>{i.name}</strong> <span className="muted small">· {new Date(i.createdAt).toLocaleString('es-PE')} · {LANG_META[i.locale]?.flag} {LANG_META[i.locale]?.label ?? i.locale}</span>
                <div className="small">{i.tour ? trValue(i.tour.title, 'es') : 'Consulta general'}</div>
              </div>
              <select value={i.status} onChange={(e) => update(i, e.target.value as Inquiry['status'])}>
                <option value="nuevo">Nuevo</option><option value="atendido">Atendido</option><option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div className="inquiry__data small">
              <a href={`mailto:${i.email}`}>{i.email}</a>
              {i.phone && <a href={waLink(i.phone)} target="_blank" rel="noreferrer">{i.phone}</a>}
              {i.country && <span>{i.country}</span>}
              {i.travelDate && <span>Viaje: {String(i.travelDate).slice(0, 10)}</span>}
              <span>{i.adults} adulto(s){i.children > 0 && ` + ${i.children} niño(s)`}</span>
            </div>
            {i.message && <p>{i.message}</p>}
            <button className="btn btn--sm btn--danger-ghost" onClick={() => remove(i)}>Eliminar</button>
          </div>
        ))}
        {data?.data.length === 0 && <p className="muted">No hay consultas.</p>}
      </div>
      {data && data.meta.lastPage > 1 && (
        <div className="row-actions">
          <button className="btn btn--sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Anterior</button>
          <span className="muted">Página {data.meta.currentPage} de {data.meta.lastPage}</span>
          <button className="btn btn--sm" disabled={page >= data.meta.lastPage} onClick={() => setPage(page + 1)}>Siguiente →</button>
        </div>
      )}
    </>
  )
}
